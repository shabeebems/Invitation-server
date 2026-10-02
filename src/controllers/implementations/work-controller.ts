import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import TYPES from "../../constants/types";
import { AuthLocals } from "../../middlewares/require-user.middleware";
import type IWorkService from "../../services/interfaces/work-service.interface";
import IWorkController from "../interfaces/work-controller.interface";

@injectable()
export default class WorkController implements IWorkController {
  constructor(@inject(TYPES.IWorkService) private readonly workService: IWorkService) {}

  async list(_req: Request, res: Response): Promise<void> {
    const auth = res.locals.auth as AuthLocals;
    const works = await this.workService.list(auth);

    res.status(200).json({
      success: true,
      works,
    });
  }

  async show(req: Request, res: Response): Promise<void> {
    const json = await this.workService.show(String(req.params.slug || ""));

    res.status(200).json({
      success: true,
      work: json,
      template: json,
    });
  }

  async create(req: Request, res: Response): Promise<void> {
    const auth = res.locals.auth as AuthLocals;
    const json = await this.workService.create(req.body, auth.userId);

    res.status(201).json({
      success: true,
      work: json,
      template: json,
    });
  }

  async update(req: Request, res: Response): Promise<void> {
    const auth = res.locals.auth as AuthLocals;
    const json = await this.workService.update(String(req.params.slug || ""), req.body, auth, req.file);

    res.status(200).json({
      success: true,
      work: json,
      template: json,
    });
  }

  async selectTheme(req: Request, res: Response): Promise<void> {
    const auth = res.locals.auth as AuthLocals;
    const json = await this.workService.selectTheme(String(req.params.slug || ""), req.body, auth);

    res.status(200).json({
      success: true,
      work: json,
      template: json,
    });
  }
}
