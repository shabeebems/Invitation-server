import { Types } from "mongoose";
import { IOrder } from "../../models/order.model";

export default interface IOrderRepository {
  create(data: Partial<IOrder>): Promise<IOrder>;
  findById(id: string): Promise<IOrder | null>;
  findByOrderNumber(orderNumber: string): Promise<IOrder | null>;
  findByRazorpayOrderId(razorpayOrderId: string): Promise<IOrder | null>;
  findPendingOrderByUserAndTemplate(userId: string, templateId: string): Promise<IOrder | null>;
  findUnlinkedPaidOrderByUserAndTemplate(userId: string, templateId: string): Promise<IOrder | null>;
  findByUserAndWork(userId: string, workId: string): Promise<IOrder | null>;
  update(id: string, data: Partial<IOrder>): Promise<IOrder | null>;
  /** Marks CREATED/ATTEMPTED/FAILED → PAID once; returns null if already PAID. */
  markPaidIfUnpaid(id: string, data: Partial<IOrder>): Promise<IOrder | null>;
  /**
   * Atomically attaches a work to a PAID order that is still unlinked.
   * Returns null if the order was already claimed or does not match.
   */
  claimUnlinkedPaidOrder(input: {
    orderId: string;
    userId: string;
    templateId: string;
    workId: Types.ObjectId;
  }): Promise<IOrder | null>;
  /** Clears workId only if it still matches the provisional claim. */
  releaseWorkClaim(orderId: string, workId: Types.ObjectId): Promise<void>;
  listByUser(userId: string): Promise<IOrder[]>;
}
