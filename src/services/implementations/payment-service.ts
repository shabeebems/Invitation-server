import "reflect-metadata";
import { inject, injectable } from "inversify";
import { Types } from "mongoose";
import { BadRequestError, ForbiddenError, NotFoundError } from "../../common/errors";
import { guard } from "../../common/helpers/guard";
import TYPES from "../../constants/types";
import { IOrder } from "../../models/order.model";
import IOrderRepository from "../../repositories/interfaces/order-repository.interface";
import ITemplateRepository from "../../repositories/interfaces/template-repository.interface";
import IUserRepository from "../../repositories/interfaces/user-repository.interface";
import IWorkRepository from "../../repositories/interfaces/work-repository.interface";
import IPaymentGateway from "../interfaces/payment-gateway.interface";
import IPaymentService, {
  CreateOrderInput,
  CreateOrderResult,
  VerifyPaymentInput,
  VerifyPaymentResult,
} from "../interfaces/payment-service.interface";

@injectable()
export default class PaymentService implements IPaymentService {
  private flatPricePaise: number;
  private currency: string;

  constructor(
    @inject(TYPES.IOrderRepository) private orderRepository: IOrderRepository,
    @inject(TYPES.IPaymentGateway) private paymentGateway: IPaymentGateway,
    @inject(TYPES.ITemplateRepository) private templateRepository: ITemplateRepository,
    @inject(TYPES.IWorkRepository) private workRepository: IWorkRepository,
    @inject(TYPES.IUserRepository) private userRepository: IUserRepository
  ) {
    const envPrice = Number(process.env.FLAT_PRICE_PAISE);
    this.flatPricePaise = !isNaN(envPrice) && envPrice > 0 ? envPrice : 49900;
    this.currency = (process.env.CURRENCY || "INR").toUpperCase();
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
      const template = await this.templateRepository.findById(input.templateId);
      if (!template) {
        throw new NotFoundError("Template not found");
      }

      let linkedWorkId: Types.ObjectId | undefined;
      let invitationName = input.draftName || template.name;

      if (input.workSlug) {
        const existingWork = await this.workRepository.findBySlug(input.workSlug);
        // Only link and check if this work belongs to the authenticated user
        if (existingWork && this.idOf(existingWork.userId) === userId) {
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
          linkedWorkId = existingWork._id as Types.ObjectId;
          invitationName = existingWork.name || invitationName;
        }
      }

      // If user has an already PAID order for this template that has not been linked to a work yet (e.g. browser dropped or webhook fulfilled)
      const unlinkedPaid = await this.orderRepository.findUnlinkedPaidOrderByUserAndTemplate(
        userId,
        input.templateId
      );

      if (unlinkedPaid) {
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

      // Check if user has an active, unexpired CREATED order for this template or work within the last 30 minutes
      const existingPending = await this.orderRepository.findPendingOrderByUserAndTemplate(
        userId,
        input.templateId
      );

      const user = await this.userRepository.findById(userId);
      const customerName = user?.name || "Customer";
      const customerEmail = user?.email || userMeta?.email || "";
      const rawPhone = user?.phone || userMeta?.phone || "";
      const digits = rawPhone.replace(/\D/g, "");
      const customerPhone = digits.length >= 10 ? digits.slice(-10) : undefined;

      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      if (
        existingPending &&
        existingPending.createdAt > thirtyMinutesAgo &&
        existingPending.amount === this.flatPricePaise
      ) {
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
          notes: {
            invitationName,
          },
        };
      }

      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

      const gatewayOrder = await this.paymentGateway.createOrder({
        amount: this.flatPricePaise,
        currency: this.currency,
        receipt: orderNumber,
        notes: {
          invitationName,
          userId,
          templateId: input.templateId,
        },
      });

      const order = await this.orderRepository.create({
        orderNumber,
        userId: new Types.ObjectId(userId),
        templateId: new Types.ObjectId(input.templateId),
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
        notes: {
          invitationName,
        },
      };
    });
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
        let workSlug: string | undefined;
        if (order.workId) {
          const w = await this.workRepository.findById(this.idOf(order.workId));
          workSlug = w?.slug;
        }
        return {
          success: true,
          status: "PAID",
          orderNumber: order.orderNumber,
          workSlug,
          publishedUrl: workSlug ? `/${workSlug}` : undefined,
        };
      }

      // Verify cryptographic signature
      const isValid = this.paymentGateway.verifyPaymentSignature(
        input.razorpayOrderId,
        input.razorpayPaymentId,
        input.razorpaySignature
      );

      if (!isValid) {
        await this.orderRepository.update(String(order._id), {
          status: "FAILED",
          failureReason: "Signature verification failed",
        });
        throw new BadRequestError("Invalid payment signature");
      }

      const now = new Date();
      await this.orderRepository.update(String(order._id), {
        status: "PAID",
        razorpayPaymentId: input.razorpayPaymentId,
        razorpaySignature: input.razorpaySignature,
        paidAt: now,
      });

      let workSlug: string | undefined;

      // Activate and publish linked work if present
      if (order.workId) {
        const work = await this.workRepository.findById(this.idOf(order.workId));
        if (work) {
          work.paymentStatus = "paid";
          work.isPublished = true;
          work.orderId = order._id as Types.ObjectId;
          work.publishedAt = now;
          await work.save();
          workSlug = work.slug;
        }
      }

      return {
        success: true,
        status: "PAID",
        orderNumber: order.orderNumber,
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
          if (order && order.status !== "PAID") {
            const now = new Date();
            await this.orderRepository.update(String(order._id), {
              status: "PAID",
              razorpayPaymentId: payment?.id || order.razorpayPaymentId,
              paidAt: now,
            });

            if (order.workId) {
              const work = await this.workRepository.findById(this.idOf(order.workId));
              if (work) {
                work.paymentStatus = "paid";
                work.isPublished = true;
                work.orderId = order._id as Types.ObjectId;
                work.publishedAt = now;
                await work.save();
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
