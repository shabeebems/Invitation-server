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
  listByUser(userId: string): Promise<IOrder[]>;
}
