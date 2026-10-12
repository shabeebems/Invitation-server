import { inject, injectable } from "inversify";
import { guard } from "../../common/helpers/guard";
import TYPES from "../../constants/types";
import type IUserRepository from "../../repositories/interfaces/user-repository.interface";
import IUserAdminService from "../interfaces/user-admin-service.interface";

@injectable()
export default class UserAdminService implements IUserAdminService {
  constructor(@inject(TYPES.IUserRepository) private readonly users: IUserRepository) {}

  async list() {
    return guard("Could not load users", async () => {
      const rows = await this.users.findAll();

      return rows.map((user) => ({
        id: String(user._id),
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        role: (user.role === "admin" || user.isAdmin ? "admin" : "customer") as
          | "admin"
          | "customer",
        emailVerified: Boolean(user.emailVerified),
        createdAt: user.createdAt,
      }));
    });
  }
}
