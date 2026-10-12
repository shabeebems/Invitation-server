import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import TYPES from "../../constants/types";
import type IUserAdminService from "../../services/interfaces/user-admin-service.interface";
import IUserAdminController from "../interfaces/user-admin-controller.interface";

@injectable()
export default class UserAdminController implements IUserAdminController {
  constructor(
    @inject(TYPES.IUserAdminService) private readonly userAdminService: IUserAdminService
  ) {}

  async list(_req: Request, res: Response): Promise<void> {
    const users = await this.userAdminService.list();

    res.status(200).json({
      success: true,
      users,
    });
  }
}
