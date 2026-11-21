import "reflect-metadata";
import { injectable } from "inversify";
import { Types } from "mongoose";
import { IOrder, OrderModel } from "../../models/order.model";
import IOrderRepository from "../interfaces/order-repository.interface";

@injectable()
export default class OrderRepository implements IOrderRepository {
  async create(data: Partial<IOrder>): Promise<IOrder> {
    return OrderModel.create(data);
  }

  async findById(id: string): Promise<IOrder | null> {
    return OrderModel.findById(id);
  }

  async findByOrderNumber(orderNumber: string): Promise<IOrder | null> {
    return OrderModel.findOne({ orderNumber }).populate("workId", "slug name").populate("templateId", "slug name");
  }

  async findByRazorpayOrderId(razorpayOrderId: string): Promise<IOrder | null> {
    return OrderModel.findOne({ razorpayOrderId });
  }

  async findPendingOrderByUserAndTemplate(userId: string, templateId: string): Promise<IOrder | null> {
    return OrderModel.findOne({
      userId,
      templateId,
      status: "CREATED",
    }).sort({ createdAt: -1 });
  }

  async findUnlinkedPaidOrderByUserAndTemplate(userId: string, templateId: string): Promise<IOrder | null> {
    return OrderModel.findOne({
      userId,
      templateId,
      status: "PAID",
      $or: [{ workId: null }, { workId: { $exists: false } }],
    }).sort({ createdAt: -1 });
  }

  async findByUserAndWork(userId: string, workId: string): Promise<IOrder | null> {
    return OrderModel.findOne({ userId, workId }).sort({ createdAt: -1 });
  }

  async update(id: string, data: Partial<IOrder>): Promise<IOrder | null> {
    return OrderModel.findByIdAndUpdate(id, { $set: data }, { new: true });
  }

  async markPaidIfUnpaid(id: string, data: Partial<IOrder>): Promise<IOrder | null> {
    const { status: _ignored, ...rest } = data;
    return OrderModel.findOneAndUpdate(
      { _id: id, status: { $ne: "PAID" } },
      { $set: { ...rest, status: "PAID" } },
      { new: true }
    );
  }

  async claimUnlinkedPaidOrder(input: {
    orderId: string;
    userId: string;
    templateId: string;
    workId: Types.ObjectId;
  }): Promise<IOrder | null> {
    return OrderModel.findOneAndUpdate(
      {
        _id: input.orderId,
        userId: input.userId,
        templateId: input.templateId,
        status: "PAID",
        $or: [{ workId: null }, { workId: { $exists: false } }],
      },
      { $set: { workId: input.workId } },
      { new: true }
    );
  }

  async releaseWorkClaim(orderId: string, workId: Types.ObjectId): Promise<void> {
    await OrderModel.updateOne({ _id: orderId, workId }, { $unset: { workId: 1 } });
  }

  async listByUser(userId: string): Promise<IOrder[]> {
    return OrderModel.find({ userId })
      .populate("workId", "slug name")
      .populate("templateId", "slug name")
      .sort({ createdAt: -1 });
  }
}
