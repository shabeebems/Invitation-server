import { Document, Schema, model } from "mongoose";

export interface IRateLimit extends Document {
  key: string;
  count: number;
  resetAt: Date;
}

const rateLimitSchema = new Schema<IRateLimit>(
  {
    key: { type: String, required: true, unique: true, index: true },
    count: { type: Number, required: true, default: 1 },
    resetAt: { type: Date, required: true },
  },
  { collection: "rate_limits" }
);

// Drop documents after the window ends so the collection stays small across instances.
rateLimitSchema.index({ resetAt: 1 }, { expireAfterSeconds: 0 });

export const RateLimitModel = model<IRateLimit>("RateLimit", rateLimitSchema);
