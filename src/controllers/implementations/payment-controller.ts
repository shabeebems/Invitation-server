import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import TYPES from "../../constants/types";
import { AuthLocals } from "../../middlewares/require-user.middleware";
import IPaymentService from "../../services/interfaces/payment-service.interface";
import IPaymentController from "../interfaces/payment-controller.interface";

@injectable()
export default class PaymentController implements IPaymentController {
  constructor(
    @inject(TYPES.IPaymentService) private readonly paymentService: IPaymentService
  ) {}

  async createOrder(req: Request, res: Response): Promise<void> {
    const auth = res.locals.auth as AuthLocals;
    const { templateId, workSlug, draftName } = req.body || {};

    const meta = {
      email: auth.email,
      ip: req.ip || req.socket.remoteAddress,
      ua: req.get("user-agent"),
    };

    const order = await this.paymentService.createOrder(
      auth.userId,
      { templateId, workSlug, draftName },
      meta
    );

    res.status(201).json({
      success: true,
      order,
    });
  }

  async verifyPayment(req: Request, res: Response): Promise<void> {
    const auth = res.locals.auth as AuthLocals;
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body || {};

    const result = await this.paymentService.verifyPayment(auth.userId, {
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    res.status(200).json({
      success: true,
      result,
    });
  }

  async handleWebhook(req: Request, res: Response): Promise<void> {
    const signature = String(req.headers["x-razorpay-signature"] || "");
    const rawBody = (req as Request & { rawBody?: Buffer | string }).rawBody || req.body;

    const result = await this.paymentService.handleWebhook(rawBody, signature);

    res.status(200).json({
      status: "ok",
      ...result,
    });
  }

  async getOrder(req: Request, res: Response): Promise<void> {
    const auth = res.locals.auth as AuthLocals;
    const orderId = String(req.params.orderId || "");

    const order = await this.paymentService.getOrder(auth.userId, orderId);

    res.status(200).json({
      success: true,
      order,
    });
  }

  async listOrders(_req: Request, res: Response): Promise<void> {
    const auth = res.locals.auth as AuthLocals;
    const orders = await this.paymentService.listOrders(auth.userId);

    res.status(200).json({
      success: true,
      orders,
    });
  }
}
