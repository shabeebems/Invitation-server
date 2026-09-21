import { UserModel, IUser } from "../models/user.model";

export class UserRepository {
  async create(user: {
    name: string;
    email: string;
    phone: string;
    isAdmin: boolean;
  }): Promise<IUser> {
    return UserModel.create(user);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return UserModel.findOne({ email: email.toLowerCase() });
  }

  async findAdmin(): Promise<IUser | null> {
    return UserModel.findOne({ isAdmin: true }).sort({ createdAt: 1 });
  }
}
