import "reflect-metadata";
import crypto from "crypto";
import { injectable } from "inversify";
import Razorpay from "razorpay";
import IPaymentGateway, {
  CreateGatewayOrderInput,
  GatewayOrderResult,
} from "../interfaces/payment-gateway.interface";

const PLACEHOLDER_KEY_ID = "rzp_test_placeholder";
const PLACEHOLDER_KEY_SECRET = "rzp_secret_placeholder";
const PLACEHOLDER_WEBHOOK_SECRET = "rzp_webhook_secret_placeholder";

@injectable()
export default class RazorpayGateway implements IPaymentGateway {
  private client: Razorpay | null = null;
  private clientKeyId = "";

  private isProduction() {
    return process.env.NODE_ENV === "production";
  }

  private config() {
    const keyId = (process.env.RAZORPAY_KEY_ID || "").trim();
    const keySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim();
    const webhookSecret = (process.env.RAZORPAY_WEBHOOK_SECRET || "").trim();
    const isMockMode =
      !keyId ||
      keyId === PLACEHOLDER_KEY_ID ||
      !keySecret ||
      keySecret === PLACEHOLDER_KEY_SECRET;

    return {
      keyId: keyId || PLACEHOLDER_KEY_ID,
      keySecret: keySecret || PLACEHOLDER_KEY_SECRET,
      webhookSecret: webhookSecret || PLACEHOLDER_WEBHOOK_SECRET,
      webhookSecretConfigured: Boolean(webhookSecret) && webhookSecret !== PLACEHOLDER_WEBHOOK_SECRET,
      isMockMode,
    };
  }

  /** Call at process boot — refuses to run production with mock/placeholder Razorpay config. */
  assertProductionReady() {
    if (!this.isProduction()) {
      return;
    }

    const { isMockMode, webhookSecretConfigured } = this.config();

    if (isMockMode) {
      throw new Error(
        "Razorpay is in mock mode. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET before running in production."
      );
    }

    if (!webhookSecretConfigured) {
      throw new Error(
        "RAZORPAY_WEBHOOK_SECRET is missing or still a placeholder. Set a real webhook secret in production."
      );
    }
  }

  private rejectMockInProduction() {
    if (this.isProduction() && this.isMock()) {
      throw new Error("Razorpay mock mode is not allowed in production");
    }
  }

  private sdk() {
    const { keyId, keySecret, isMockMode } = this.config();

    if (isMockMode) {
      this.client = null;
      this.clientKeyId = "";
      return null;
    }

    if (!this.client || this.clientKeyId !== keyId) {
      this.client = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });
      this.clientKeyId = keyId;
    }

    return this.client;
  }

  isMock(): boolean {
    return this.config().isMockMode;
  }

  getKeyId(): string {
    return this.config().keyId;
  }

  async createOrder(input: CreateGatewayOrderInput): Promise<GatewayOrderResult> {
    this.rejectMockInProduction();
    const client = this.sdk();

    if (!client) {
      const mockOrderId = `order_mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      return {
        gatewayOrderId: mockOrderId,
        amount: input.amount,
        currency: input.currency,
        receipt: input.receipt,
      };
    }

    const order = await client.orders.create({
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
    this.rejectMockInProduction();
    const { keySecret, isMockMode } = this.config();

    if (isMockMode) {
      if (
        signature === "mock_signature" ||
        signature.startsWith("mock_") ||
        paymentId.startsWith("pay_mock_") ||
        orderId.startsWith("order_mock_")
      ) {
        return true;
      }
    }

    try {
      const payload = `${orderId}|${paymentId}`;
      const expected = crypto.createHmac("sha256", keySecret).update(payload).digest("hex");
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
    this.rejectMockInProduction();
    const { webhookSecret, webhookSecretConfigured, isMockMode } = this.config();

    if (this.isProduction() && !webhookSecretConfigured) {
      return false;
    }

    if (isMockMode && signature === "mock_webhook_signature") {
      return true;
    }

    try {
      const bodyString = typeof rawBody === "string" ? rawBody : rawBody.toString("utf8");
      const expected = crypto.createHmac("sha256", webhookSecret).update(bodyString).digest("hex");
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
