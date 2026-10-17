import { IOrder } from "../../models/order.model";

export interface CreateOrderInput {
  templateId: string;
  workSlug?: string;
  draftName?: string;
}

export interface CreateOrderResult {
  orderId: string;
  orderNumber: string;
  gatewayOrderId: string;
  amount: number;
  displayAmount: string;
  currency: string;
  keyId: string;
  isMock: boolean;
  alreadyPaid?: boolean;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  notes?: Record<string, string>;
}

export interface VerifyPaymentInput {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface VerifyPaymentResult {
  success: boolean;
  status: string;
  orderNumber: string;
  workSlug?: string;
  publishedUrl?: string;
}

export default interface IPaymentService {
  createOrder(
    userId: string,
    input: CreateOrderInput,
    userMeta?: { email?: string; phone?: string; ip?: string; ua?: string }
  ): Promise<CreateOrderResult>;

  verifyPayment(userId: string, input: VerifyPaymentInput): Promise<VerifyPaymentResult>;

  handleWebhook(rawBody: string | Buffer, signature: string): Promise<{ handled: boolean; event?: string }>;

  getOrder(userId: string, orderId: string): Promise<IOrder>;

  listOrders(userId: string): Promise<IOrder[]>;
}
