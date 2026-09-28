import { Schema, model, Document } from "mongoose";

export const USER_ROLES = ["customer", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  googleId: string;
  role: UserRole;
  emailVerified: boolean;
  emailVerifyTokenHash: string;
  emailVerifyExpires: Date | null;
  passwordResetTokenHash: string;
  passwordResetExpires: Date | null;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    passwordHash: {
      type: String,
      default: "",
      select: false,
    },
    googleId: {
      type: String,
      default: "",
    },
    emailVerifyTokenHash: {
      type: String,
      default: "",
      select: false,
    },
    emailVerifyExpires: {
      type: Date,
      default: null,
    },
    passwordResetTokenHash: {
      type: String,
      default: "",
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      default: null,
    },
    role: {
      type: String,
      enum: USER_ROLES,
      default: "customer",
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

userSchema.index({ googleId: 1 }, { unique: true, partialFilterExpression: { googleId: { $gt: "" } } });

userSchema.pre("save", function syncRole() {
  if (this.isAdmin) {
    this.role = "admin";
  }

  if (this.role === "admin") {
    this.isAdmin = true;
  }
});

export const UserModel = model<IUser>("User", userSchema, "user");
