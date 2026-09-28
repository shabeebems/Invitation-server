import "reflect-metadata";
import { injectable } from "inversify";
import { UserModel, IUser } from "../../models/user.model";
import IUserRepository, { UserInput } from "../interfaces/user-repository.interface";

@injectable()
export default class UserRepository implements IUserRepository {
  async create(user: UserInput): Promise<IUser> {
    const role = user.role || (user.isAdmin ? "admin" : "customer");

    return UserModel.create({
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      passwordHash: user.passwordHash || "",
      googleId: user.googleId || "",
      role,
      emailVerified: user.emailVerified ?? false,
      isAdmin: role === "admin",
    });
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return UserModel.findOne({ email: email.toLowerCase() }).select("+passwordHash");
  }

  async findById(id: string): Promise<IUser | null> {
    return UserModel.findById(id);
  }

  async findAdmin(): Promise<IUser | null> {
    return UserModel.findOne({ $or: [{ role: "admin" }, { isAdmin: true }] }).sort({ createdAt: 1 });
  }

  async setPasswordHash(id: string, passwordHash: string): Promise<void> {
    await UserModel.updateOne({ _id: id }, { passwordHash });
  }

  findByGoogleId(googleId: string): Promise<IUser | null> {
    return UserModel.findOne({ googleId }).select("+passwordHash");
  }

  async setGoogleId(id: string, googleId: string): Promise<void> {
    await UserModel.updateOne({ _id: id }, { googleId });
  }

  async setEmailVerified(id: string): Promise<void> {
    await UserModel.updateOne(
      { _id: id },
      { emailVerified: true, emailVerifyTokenHash: "", emailVerifyExpires: null }
    );
  }

  async setVerifyToken(id: string, tokenHash: string, expiresAt: Date): Promise<void> {
    await UserModel.updateOne({ _id: id }, { emailVerifyTokenHash: tokenHash, emailVerifyExpires: expiresAt });
  }

  consumeVerifyToken(tokenHash: string): Promise<IUser | null> {
    return UserModel.findOneAndUpdate(
      { emailVerifyTokenHash: tokenHash, emailVerifyExpires: { $gt: new Date() } },
      { emailVerified: true },
      { new: true }
    );
  }

  async setResetToken(id: string, tokenHash: string, expiresAt: Date): Promise<void> {
    await UserModel.updateOne({ _id: id }, { passwordResetTokenHash: tokenHash, passwordResetExpires: expiresAt });
  }

  consumeResetToken(tokenHash: string): Promise<IUser | null> {
    return UserModel.findOneAndUpdate(
      { passwordResetTokenHash: tokenHash, passwordResetExpires: { $gt: new Date() } },
      { passwordResetTokenHash: "", passwordResetExpires: null }
    );
  }
}
