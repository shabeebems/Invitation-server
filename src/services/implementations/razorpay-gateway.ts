import "reflect-metadata";
import crypto from "crypto";
import { injectable } from "inversify";
import Razorpay from "razorpay";
import IPaymentGateway, {
  CreateGatewayOrderInput,
  GatewayOrderResult,
} from "../interfaces/payment-gateway.interface";

@injectable()
export default class RazorpayGateway implements IPaymentGateway {
  private client: Razorpay | null = null;
  private keyId: string;
  private keySecret: string;
  private webhookSecret: string;
  private isMockMode: boolean;

  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder";
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || "rzp_secret_placeholder";
    this.webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "rzp_webhook_secret_placeholder";

    // Detect placeholder / mock mode
    this.isMockMode =
      !this.keyId ||
      this.keyId === "rzp_test_placeholder" ||
      !this.keySecret ||
      this.keySecret === "rzp_secret_placeholder";

    if (!this.isMockMode) {
      this.client = new Razorpay({
        key_id: this.keyId,
        key_secret: this.keySecret,
      });
    }
  }

  isMock(): boolean {
    return this.isMockMode;
  }

  getKeyId(): string {
    return this.keyId;
  }

  async createOrder(input: CreateGatewayOrderInput): Promise<GatewayOrderResult> {
    if (this.isMockMode || !this.client) {
      const mockOrderId = `order_mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      return {
        gatewayOrderId: mockOrderId,
        amount: input.amount,
        currency: input.currency,
        receipt: input.receipt,
      };
    }

    const order = await this.client.orders.create({
      amount: input.amount,
      currency: input.currency,
      receipt: input.receipt,
      notes: input.notes,
    });

    return {
      gatewayOrderId: order.id,
      amount: Number(order.amount),
      currency: order.currency,
      receipt: String(order.receipt || input.receipt),
    };
  }

  verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
    if (this.isMockMode) {
      // In mock mode, permit valid mock markers or test signatures
      if (
        signature === "mock_signature" ||
        signature.startsWith("mock_") ||
        paymentId.startsWith("pay_mock_")
      ) {
        return true;
      }
    }

    try {
      const payload = `${orderId}|${paymentId}`;
      const expected = crypto
        .createHmac("sha256", this.keySecret)
        .update(payload)
        .digest("hex");

      const expectedBuffer = Buffer.from(expected, "utf8");
      const signatureBuffer = Buffer.from(signature, "utf8");

      if (expectedBuffer.length !== signatureBuffer.length) {
        return false;
      }

      return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
    } catch {
      return false;
    }
  }

  verifyWebhookSignature(rawBody: string | Buffer, signature: string): boolean {
    if (this.isMockMode && signature === "mock_webhook_signature") {
      return true;
    }

    try {
      const bodyString = typeof rawBody === "string" ? rawBody : rawBody.toString("utf8");
      const expected = crypto
        .createHmac("sha256", this.webhookSecret)
        .update(bodyString)
        .digest("hex");

      const expectedBuffer = Buffer.from(expected, "utf8");
      const signatureBuffer = Buffer.from(signature, "utf8");

      if (expectedBuffer.length !== signatureBuffer.length) {
        return false;
      }

      return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
    } catch {
      return false;
    }
  }
}
