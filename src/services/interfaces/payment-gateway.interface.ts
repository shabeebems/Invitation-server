export interface CreateGatewayOrderInput {
  amount: number; // in paise
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface GatewayOrderResult {
  gatewayOrderId: string;
  amount: number;
  currency: string;
  receipt: string;
}

export default interface IPaymentGateway {
  createOrder(input: CreateGatewayOrderInput): Promise<GatewayOrderResult>;
  verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean;
  verifyWebhookSignature(rawBody: string | Buffer, signature: string): boolean;
  getKeyId(): string;
  isMock(): boolean;
}
