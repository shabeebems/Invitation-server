import { IUser, UserRole } from "../../models/user.model";

export type UserInput = {
  name: string;
  email: string;
  phone?: string;
  passwordHash?: string;
  googleId?: string;
  role?: UserRole;
  emailVerified?: boolean;
  isAdmin?: boolean;
};

export default interface IUserRepository {
  create(user: UserInput): Promise<IUser>;
  findByEmail(email: string): Promise<IUser | null>;
  findById(id: string): Promise<IUser | null>;
  findAdmin(): Promise<IUser | null>;
  findByGoogleId(googleId: string): Promise<IUser | null>;
  setGoogleId(id: string, googleId: string): Promise<void>;
  setPasswordHash(id: string, passwordHash: string): Promise<void>;
  setEmailVerified(id: string): Promise<void>;
  setVerifyToken(id: string, tokenHash: string, expiresAt: Date): Promise<void>;
  consumeVerifyToken(tokenHash: string): Promise<IUser | null>;
  setResetToken(id: string, tokenHash: string, expiresAt: Date): Promise<void>;
  consumeResetToken(tokenHash: string): Promise<IUser | null>;
}
