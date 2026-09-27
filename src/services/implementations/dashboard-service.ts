import { inject, injectable } from "inversify";
import { NotFoundError } from "../../common/errors";
import { guard } from "../../common/helpers/guard";
import TYPES from "../../constants/types";
import type IUserRepository from "../../repositories/interfaces/user-repository.interface";
import IDashboardService from "../interfaces/dashboard-service.interface";

@injectable()
export default class DashboardService implements IDashboardService {
  constructor(@inject(TYPES.IUserRepository) private readonly userRepository: IUserRepository) {}

  async show() {
    return guard("Could not load dashboard user", async () => {
      const user = await this.userRepository.findAdmin();

      if (!user) {
        throw new NotFoundError("No user found");
      }

      return {
        message: `Welcome ${user.name}`,
        user: {
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role === "admin" || user.isAdmin ? ("admin" as const) : ("customer" as const),
          emailVerified: Boolean(user.emailVerified),
          isAdmin: user.role === "admin" || user.isAdmin,
        },
      };
    });
  }
}
