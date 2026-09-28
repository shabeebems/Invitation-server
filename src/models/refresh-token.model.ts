import { Schema, model, Document, Types } from "mongoose";

export interface IRefreshToken extends Document {
  userId: Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
  replacedBy: Types.ObjectId | null;
  lastUsedAt: Date | null;
  userAgent: string;
  ip: string;
  createdAt: Date;
  updatedAt: Date;
}

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
    replacedBy: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    lastUsedAt: {
      type: Date,
      default: null,
    },
    userAgent: {
      type: String,
      default: "",
    },
    ip: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export const RefreshTokenModel = model<IRefreshToken>("RefreshToken", refreshTokenSchema);
