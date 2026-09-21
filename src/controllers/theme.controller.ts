import { Request, Response } from "express";
import { ThemeRepository } from "../repositories/theme.repository";
import { toThemeJson } from "../mapper/theme.mapper";

const themeRepository = new ThemeRepository();

export class ThemeController {
  async list(req: Request, res: Response): Promise<void> {
    try {
      const templateId = String(req.query.templateId || "").trim();
      const themes = templateId
        ? await themeRepository.findByTemplateId(templateId)
        : await themeRepository.findAll();

      res.status(200).json({
        success: true,
        themes: themes.map(toThemeJson),
      });
    } catch {
      res.status(500).json({
        success: false,
        message: "Could not load themes",
      });
    }
  }
}
