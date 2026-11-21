import "reflect-metadata";
import { inject, injectable } from "inversify";
import { Types } from "mongoose";
import { BadRequestError, ForbiddenError, NotFoundError } from "../../common/errors";
import { guard } from "../../common/helpers/guard";
import TYPES from "../../constants/types";
import { DEFAULT_ACTUAL_PRICE, DEFAULT_OFFER_PRICE, ITemplate } from "../../models/template.model";
import { IOrder } from "../../models/order.model";
import IOrderRepository from "../../repositories/interfaces/order-repository.interface";
import ITemplateRepository from "../../repositories/interfaces/template-repository.interface";
import IUserRepository from "../../repositories/interfaces/user-repository.interface";
import IWorkRepository from "../../repositories/interfaces/work-repository.interface";
import INotificationService from "../interfaces/notification-service.interface";
import IPaymentGateway from "../interfaces/payment-gateway.interface";
import IPaymentService, {
  CreateOrderInput,
  CreateOrderResult,
  VerifyPaymentInput,
  VerifyPaymentResult,
} from "../interfaces/payment-service.interface";

@injectable()
export default class PaymentService implements IPaymentService {
  private currency: string;

  constructor(
    @inject(TYPES.IOrderRepository) private orderRepository: IOrderRepository,
    @inject(TYPES.IPaymentGateway) private paymentGateway: IPaymentGateway,
    @inject(TYPES.ITemplateRepository) private templateRepository: ITemplateRepository,
    @inject(TYPES.IWorkRepository) private workRepository: IWorkRepository,
    @inject(TYPES.IUserRepository) private userRepository: IUserRepository,
    @inject(TYPES.INotificationService) private notifications: INotificationService
  ) {
    this.currency = (process.env.CURRENCY || "INR").toUpperCase();
  }

  private rupeesToPaise(rupees: unknown, fallback: number): number {
    const value = Number(rupees);
    const whole = Number.isFinite(value) && value >= 0 ? Math.round(value) : fallback;
    return whole * 100;
  }

  private offerPaise(template: ITemplate): number {
    return this.rupeesToPaise(template.offerPrice, DEFAULT_OFFER_PRICE);
  }

  private actualPaise(template: ITemplate): number {
    return this.rupeesToPaise(template.actualPrice, DEFAULT_ACTUAL_PRICE);
  }

  private formatDisplayAmount(amountInPaise: number, currency: string): string {
    const inMajor = (amountInPaise / 100).toFixed(2);
    if (currency === "INR") {
      return `₹${inMajor}`;
    }
    return `${currency} ${inMajor}`;
  }

  private idOf(ref: unknown): string {
    if (ref && typeof ref === "object" && "_id" in ref) {
      return String((ref as { _id: unknown })._id);
    }
    return String(ref || "");
  }

  async createOrder(
    userId: string,
    input: CreateOrderInput,
    userMeta?: { email?: string; phone?: string; ip?: string; ua?: string }
  ): Promise<CreateOrderResult> {
    return guard("Could not create payment order", async () => {
      let linkedWorkId: Types.ObjectId | undefined;
      let invitationName = String(input.draftName || "").trim();
      // Prefer the work's template when paying for an existing invitation — never trust a
      // mismatched client templateId for pricing / order binding.
      let templateId = String(input.templateId || "").trim();

      if (input.workSlug) {
        const existingWork = await this.workRepository.findBySlug(input.workSlug);

        if (!existingWork) {
          throw new NotFoundError("Invitation not found");
        }

        if (this.idOf(existingWork.userId) !== userId) {
          throw new ForbiddenError("Not authorized to pay for this invitation");
        }

        if (existingWork.paymentStatus === "paid") {
          return {
            orderId: String(existingWork.orderId || ""),
            orderNumber: "ALREADY_PAID",
            gatewayOrderId: "",
            amount: 0,
            displayAmount: "₹0.00",
            currency: this.currency,
            keyId: this.paymentGateway.getKeyId(),
            isMock: this.paymentGateway.isMock(),
            alreadyPaid: true,
            notes: {
              invitationName: existingWork.name || invitationName,
            },
          };
        }

        const workTemplateId = this.idOf(existingWork.templateId);
        if (templateId && templateId !== workTemplateId) {
          throw new BadRequestError("Payment template does not match this invitation");
        }

        templateId = workTemplateId;
        linkedWorkId = existingWork._id as Types.ObjectId;
        invitationName = existingWork.name || invitationName;
      }

      if (!templateId) {
        throw new BadRequestError("Template is required");
      }

      const template = await this.templateRepository.findById(templateId);
      if (!template) {
        throw new NotFoundError("Template not found");
      }

      if (!template.isActive) {
        throw new BadRequestError("This template is no longer available for purchase");
      }

      invitationName = invitationName || template.name;

      // Heal: PAID order already linked to this unpaid work (verify/webhook published after mark-paid failed).
      // Without this, retrying checkout would create a second charge.
      if (linkedWorkId) {
        const linkedPaid = await this.orderRepository.findByUserAndWork(userId, String(linkedWorkId));
        if (
          linkedPaid?.status === "PAID" &&
          this.idOf(linkedPaid.templateId) === templateId
        ) {
          await this.publishLinkedWork(linkedPaid, new Date());
          const healed = await this.workRepository.findById(String(linkedWorkId));
          if (healed?.paymentStatus === "paid") {
            return {
              orderId: String(linkedPaid._id),
              orderNumber: linkedPaid.orderNumber,
              gatewayOrderId: linkedPaid.razorpayOrderId,
              amount: 0,
              displayAmount: "₹0.00",
              currency: this.currency,
              keyId: this.paymentGateway.getKeyId(),
              isMock: this.paymentGateway.isMock(),
              alreadyPaid: true,
              notes: {
                invitationName,
              },
            };
          }
        }
      }

      // If user has an already PAID order for this template that has not been linked to a work yet (e.g. browser dropped or webhook fulfilled)
      const unlinkedPaid = await this.orderRepository.findUnlinkedPaidOrderByUserAndTemplate(
        userId,
        templateId
      );

      if (unlinkedPaid) {
        // Draft flow: client createWork will claim this paid order.
        if (!linkedWorkId) {
          return {
            orderId: String(unlinkedPaid._id),
            orderNumber: unlinkedPaid.orderNumber,
            gatewayOrderId: unlinkedPaid.razorpayOrderId,
            amount: 0,
            displayAmount: "₹0.00",
            currency: this.currency,
            keyId: this.paymentGateway.getKeyId(),
            isMock: this.paymentGateway.isMock(),
            alreadyPaid: true,
            notes: {
              invitationName,
            },
          };
        }

        let orderForPublish = await this.orderRepository.claimUnlinkedPaidOrder({
          orderId: String(unlinkedPaid._id),
          userId,
          templateId,
          workId: linkedWorkId,
        });

        if (!orderForPublish) {
          const latest = await this.orderRepository.findById(String(unlinkedPaid._id));
          if (latest && this.idOf(latest.workId) === String(linkedWorkId)) {
            orderForPublish = latest;
          }
        }

        if (orderForPublish && this.idOf(orderForPublish.workId) === String(linkedWorkId)) {
          try {
            await this.publishLinkedWork(orderForPublish, new Date());
          } catch (error) {
            await this.orderRepository
              .releaseWorkClaim(String(orderForPublish._id), linkedWorkId)
              .catch(() => undefined);
            throw error;
          }

          return {
            orderId: String(orderForPublish._id),
            orderNumber: orderForPublish.orderNumber,
            gatewayOrderId: orderForPublish.razorpayOrderId,
            amount: 0,
            displayAmount: "₹0.00",
            currency: this.currency,
            keyId: this.paymentGateway.getKeyId(),
            isMock: this.paymentGateway.isMock(),
            alreadyPaid: true,
            notes: {
              invitationName,
            },
          };
        }

        // Paid order was claimed by a different work — continue and create a new order
        // for this unpaid invitation instead of returning a false alreadyPaid.
      }

      // Check if user has an active, unexpired CREATED order for this template or work within the last 30 minutes
      const existingPending = await this.orderRepository.findPendingOrderByUserAndTemplate(
        userId,
        templateId
      );

      const user = await this.userRepository.findById(userId);
      const customerName = user?.name || "Customer";
      const customerEmail = user?.email || userMeta?.email || "";
      const rawPhone = user?.phone || userMeta?.phone || "";
      const digits = rawPhone.replace(/\D/g, "");
      const customerPhone = digits.length >= 10 ? digits.slice(-10) : undefined;

      const pricePaise = this.offerPaise(template);
      const listPaise = this.actualPaise(template);
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      const pendingIsMock = String(existingPending?.razorpayOrderId || "").startsWith("order_mock_");
      const canReusePending =
        existingPending &&
        existingPending.createdAt > thirtyMinutesAgo &&
        existingPending.amount === pricePaise &&
        pendingIsMock === this.paymentGateway.isMock();

      if (existingPending && !canReusePending) {
        await this.orderRepository.update(String(existingPending._id), {
          status: "EXPIRED",
          failureReason: pendingIsMock
            ? "Replaced mock order after Razorpay keys were configured"
            : "Payment order expired",
        });
      }

      if (canReusePending && existingPending) {
        const pendingWorkId = this.idOf(existingPending.workId);

        if (linkedWorkId) {
          // Bind (or rebind) this pending order to the invitation being paid for.
          if (pendingWorkId !== String(linkedWorkId)) {
            await this.orderRepository.update(String(existingPending._id), { workId: linkedWorkId });
          }
        } else if (pendingWorkId) {
          // Draft pay must not inherit a prior work link from an abandoned work checkout.
          await this.orderRepository.releaseWorkClaim(
            String(existingPending._id),
            existingPending.workId as Types.ObjectId
          );
        }

        return {
          orderId: String(existingPending._id),
          orderNumber: existingPending.orderNumber,
          gatewayOrderId: existingPending.razorpayOrderId,
          amount: existingPending.amount,
          displayAmount: this.formatDisplayAmount(existingPending.amount, existingPending.currency),
          currency: existingPending.currency,
          keyId: this.paymentGateway.getKeyId(),
          isMock: this.paymentGateway.isMock(),
          customerName,
          customerEmail,
          customerPhone,
          actualDisplayAmount:
            listPaise > pricePaise ? this.formatDisplayAmount(listPaise, existingPending.currency) : undefined,
          notes: {
            invitationName,
          },
        };
      }

      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

      const gatewayOrder = await this.paymentGateway.createOrder({
        amount: pricePaise,
        currency: this.currency,
        receipt: orderNumber,
        notes: {
          invitationName,
          userId,
          templateId,
        },
      });

      const order = await this.orderRepository.create({
        orderNumber,
        userId: new Types.ObjectId(userId),
        templateId: new Types.ObjectId(templateId),
        workId: linkedWorkId,
        amount: gatewayOrder.amount,
        currency: gatewayOrder.currency,
        status: "CREATED",
        gateway: "razorpay",
        razorpayOrderId: gatewayOrder.gatewayOrderId,
        metadata: {
          invitationName,
          customerEmail,
          customerPhone,
          ipAddress: userMeta?.ip || "",
          userAgent: userMeta?.ua || "",
        },
      });

      return {
        orderId: String(order._id),
        orderNumber: order.orderNumber,
        gatewayOrderId: order.razorpayOrderId,
        amount: order.amount,
        displayAmount: this.formatDisplayAmount(order.amount, order.currency),
        currency: order.currency,
        keyId: this.paymentGateway.getKeyId(),
        isMock: this.paymentGateway.isMock(),
        customerName,
        customerEmail,
        customerPhone,
        actualDisplayAmount:
          listPaise > pricePaise ? this.formatDisplayAmount(listPaise, order.currency) : undefined,
        notes: {
          invitationName,
        },
      };
    });
  }

  private async paidResult(order: IOrder): Promise<VerifyPaymentResult> {
    // Idempotent: also heal linked works that stayed unpaid after a prior publish failure.
    const workSlug = order.workId
      ? (await this.publishLinkedWork(order, new Date())) ||
        (await this.workRepository.findById(this.idOf(order.workId)))?.slug
      : undefined;

    return {
      success: true,
      status: "PAID",
      orderNumber: order.orderNumber,
      workSlug,
      publishedUrl: workSlug ? `/${workSlug}` : undefined,
    };
  }

  private async publishLinkedWork(order: IOrder, now: Date) {
    if (!order.workId) {
      return undefined as string | undefined;
    }

    const work = await this.workRepository.findById(this.idOf(order.workId));
    if (!work) {
      return undefined;
    }

    work.paymentStatus = "paid";
    work.isPublished = true;
    work.orderId = order._id as Types.ObjectId;
    work.publishedAt = now;
    await work.save();
    void this.notifications.invitationPublished(String(work._id));
    return work.slug;
  }

  async verifyPayment(userId: string, input: VerifyPaymentInput): Promise<VerifyPaymentResult> {
    return guard("Payment verification failed", async () => {
      const order = await this.orderRepository.findById(input.orderId);
      if (!order) {
        throw new NotFoundError("Payment order not found");
      }

      if (this.idOf(order.userId) !== userId) {
        throw new ForbiddenError("Not authorized to verify this order");
      }

      // Idempotency: already paid
      if (order.status === "PAID") {
        return this.paidResult(order);
      }

      const razorpayOrderId = String(input.razorpayOrderId || "").trim();
      const razorpayPaymentId = String(input.razorpayPaymentId || "").trim();
      const razorpaySignature = String(input.razorpaySignature || "").trim();

      if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        throw new BadRequestError("Payment proof is incomplete");
      }

      // Bind gateway proof to this DB order — blocks cross-order verification.
      if (razorpayOrderId !== String(order.razorpayOrderId || "")) {
        throw new BadRequestError("Payment does not match this order");
      }

      const mockOrder =
        this.paymentGateway.isMock() && String(order.razorpayOrderId || "").startsWith("order_mock_");
      const isValid =
        mockOrder ||
        this.paymentGateway.verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);

      if (!isValid) {
        await this.orderRepository.update(String(order._id), {
          status: "FAILED",
          failureReason: "Signature verification failed",
        });
        throw new BadRequestError("Invalid payment signature");
      }

      const now = new Date();
      const paid = await this.orderRepository.markPaidIfUnpaid(String(order._id), {
        razorpayPaymentId,
        razorpaySignature,
        paidAt: now,
      });

      // Concurrent verify/webhook already marked PAID — treat as success.
      if (!paid) {
        const latest = await this.orderRepository.findById(String(order._id));
        if (latest?.status === "PAID") {
          return this.paidResult(latest);
        }
        throw new BadRequestError("Could not confirm payment");
      }

      // Payment is durable once marked PAID. Do not fail verify if publish throws —
      // createOrder / webhook / re-verify will heal the linked work.
      let workSlug: string | undefined;
      try {
        workSlug = await this.publishLinkedWork(paid, now);
      } catch (error) {
        console.error("[payment] publish after verify failed", error);
      }

      return {
        success: true,
        status: "PAID",
        orderNumber: paid.orderNumber,
        workSlug,
        publishedUrl: workSlug ? `/${workSlug}` : undefined,
      };
    });
  }

  async handleWebhook(
    rawBody: string | Buffer,
    signature: string
  ): Promise<{ handled: boolean; event?: string }> {
    return guard("Webhook processing failed", async () => {
      const isValid = this.paymentGateway.verifyWebhookSignature(rawBody, signature);
      if (!isValid) {
        throw new BadRequestError("Invalid webhook signature");
      }

      const bodyText = Buffer.isBuffer(rawBody)
        ? rawBody.toString("utf8")
        : typeof rawBody === "string"
          ? rawBody
          : JSON.stringify(rawBody);
      const event = typeof rawBody === "object" && !Buffer.isBuffer(rawBody) ? rawBody : JSON.parse(bodyText);

      const eventType: string = event.event;

      if (eventType === "payment.captured" || eventType === "order.paid") {
        const payment = event.payload?.payment?.entity;
        const razorpayOrderId = payment?.order_id || event.payload?.order?.entity?.id;

        if (razorpayOrderId) {
          const order = await this.orderRepository.findByRazorpayOrderId(razorpayOrderId);
          if (order) {
            const now = new Date();
            if (order.status !== "PAID") {
              await this.orderRepository.markPaidIfUnpaid(String(order._id), {
                razorpayPaymentId: payment?.id || order.razorpayPaymentId,
                paidAt: now,
              });
            }

            const latest = await this.orderRepository.findById(String(order._id));
            if (latest?.status === "PAID") {
              try {
                await this.publishLinkedWork(latest, now);
              } catch (error) {
                console.error("[payment] publish after webhook failed", error);
              }
            }
          }
        }
        return { handled: true, event: eventType };
      }

      if (eventType === "payment.failed") {
        const payment = event.payload?.payment?.entity;
        const razorpayOrderId = payment?.order_id;
        if (razorpayOrderId) {
          const order = await this.orderRepository.findByRazorpayOrderId(razorpayOrderId);
          if (order && order.status !== "PAID") {
            await this.orderRepository.update(String(order._id), {
              status: "FAILED",
              failureReason: payment?.error_description || "Payment failed",
            });
          }
        }
        return { handled: true, event: eventType };
      }

      return { handled: true, event: eventType };
    });
  }

  async getOrder(userId: string, orderId: string): Promise<IOrder> {
    return guard("Could not get order", async () => {
      const order = await this.orderRepository.findById(orderId);
      if (!order) {
        throw new NotFoundError("Order not found");
      }
      if (String(order.userId) !== userId) {
        throw new ForbiddenError("Not authorized to view this order");
      }
      return order;
    });
  }

  async listOrders(userId: string): Promise<IOrder[]> {
    return guard("Could not list orders", async () => {
      return this.orderRepository.listByUser(userId);
    });
  }
}
