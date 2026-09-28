import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import TYPES from "../../constants/types";
import type ITemplateService from "../../services/interfaces/template-service.interface";
import ITemplateController from "../interfaces/template-controller.interface";

@injectable()
export default class TemplateController implements ITemplateController {
  constructor(
    @inject(TYPES.ITemplateService) private readonly templateService: ITemplateService
  ) {}

  async list(_req: Request, res: Response): Promise<void> {
    const templates = await this.templateService.list();

    res.status(200).json({
      success: true,
      templates,
    });
  }

  async show(req: Request, res: Response): Promise<void> {
    const template = await this.templateService.show(String(req.params.slug || ""));

    res.status(200).json({
      success: true,
      template,
    });
  }

  async update(req: Request, res: Response): Promise<void> {
    const template = await this.templateService.update(
      String(req.params.slug || ""),
      req.body,
      req.file
    );

    res.status(200).json({
      success: true,
      template,
    });
  }

  async selectTheme(req: Request, res: Response): Promise<void> {
    const template = await this.templateService.selectTheme(String(req.params.slug || ""), req.body);

    res.status(200).json({
      success: true,
      template,
    });
  }
}
