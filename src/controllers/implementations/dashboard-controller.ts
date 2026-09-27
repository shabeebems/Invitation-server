import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import TYPES from "../../constants/types";
import type IDashboardService from "../../services/interfaces/dashboard-service.interface";
import IDashboardController from "../interfaces/dashboard-controller.interface";

@injectable()
export default class DashboardController implements IDashboardController {
  constructor(
    @inject(TYPES.IDashboardService) private readonly dashboardService: IDashboardService
  ) {}

  async show(_req: Request, res: Response): Promise<void> {
    const data = await this.dashboardService.show();

    res.status(200).json({
      success: true,
      message: data.message,
      user: data.user,
    });
  }
}
