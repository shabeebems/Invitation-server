import { Request, Response } from "express";
import { UserRepository } from "../repositories/user.repository";

const userRepository = new UserRepository();

export class DashboardController {
  async show(_req: Request, res: Response): Promise<void> {
    try {
      const user = await userRepository.findAdmin();

      if (!user) {
        res.status(404).json({
          success: false,
          message: "No user found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: `Welcome ${user.name}`,
        user: {
          name: user.name,
          email: user.email,
          phone: user.phone,
          isAdmin: user.isAdmin,
        },
      });
    } catch {
      res.status(500).json({
        success: false,
        message: "Could not load dashboard user",
      });
    }
  }
}
