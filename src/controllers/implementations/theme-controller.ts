import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import TYPES from "../../constants/types";
import type IThemeService from "../../services/interfaces/theme-service.interface";
import IThemeController from "../interfaces/theme-controller.interface";

@injectable()
export default class ThemeController implements IThemeController {
  constructor(@inject(TYPES.IThemeService) private readonly themeService: IThemeService) {}

  async list(req: Request, res: Response): Promise<void> {
    const themes = await this.themeService.list(String(req.query.templateId || "").trim());

    res.status(200).json({
      success: true,
      themes,
    });
  }
}
