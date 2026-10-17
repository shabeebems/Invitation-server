import { Schema, model, Document, Types } from "mongoose";

export type OrderStatus = "CREATED" | "ATTEMPTED" | "PAID" | "FAILED" | "EXPIRED";

export interface IOrderMetadata {
  invitationName?: string;
  customerEmail?: string;
  customerPhone?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  userId: Types.ObjectId;
  workId?: Types.ObjectId;
  templateId: Types.ObjectId;
  amount: number;
  currency: string;
  status: OrderStatus;
  gateway: "razorpay";
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  failureReason?: string;
  metadata?: IOrderMetadata;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    workId: {
      type: Schema.Types.ObjectId,
      ref: "Work",
      default: null,
      index: true,
    },
    templateId: {
      type: Schema.Types.ObjectId,
      ref: "Template",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 100, // minimum 100 paise (₹1)
    },
    currency: {
      type: String,
      default: "INR",
      uppercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["CREATED", "ATTEMPTED", "PAID", "FAILED", "EXPIRED"],
      default: "CREATED",
      index: true,
    },
    gateway: {
      type: String,
      default: "razorpay",
      trim: true,
    },
    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    razorpayPaymentId: {
      type: String,
      default: null,
      sparse: true,
      index: true,
      trim: true,
    },
    razorpaySignature: {
      type: String,
      default: null,
      trim: true,
    },
    failureReason: {
      type: String,
      default: null,
      trim: true,
    },
    metadata: {
      invitationName: { type: String, default: "" },
      customerEmail: { type: String, default: "" },
      customerPhone: { type: String, default: "" },
      ipAddress: { type: String, default: "" },
      userAgent: { type: String, default: "" },
    },
    paidAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export const OrderModel = model<IOrder>("Order", orderSchema, "orders");
