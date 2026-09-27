import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import TYPES from "../../constants/types";
import type ICategoryService from "../../services/interfaces/category-service.interface";
import ICategoryController from "../interfaces/category-controller.interface";

@injectable()
export default class CategoryController implements ICategoryController {
  constructor(
    @inject(TYPES.ICategoryService) private readonly categoryService: ICategoryService
  ) {}

  async list(_req: Request, res: Response): Promise<void> {
    const categories = await this.categoryService.list();

    res.status(200).json({
      success: true,
      categories,
    });
  }

  async create(req: Request, res: Response): Promise<void> {
    const category = await this.categoryService.create({
      name: req.body?.name,
      description: req.body?.description,
      isActive: req.body?.isActive,
      file: req.file,
    });

    res.status(201).json({
      success: true,
      category,
    });
  }

  async update(req: Request, res: Response): Promise<void> {
    const category = await this.categoryService.update(String(req.params.id || ""), {
      name: req.body?.name,
      description: req.body?.description,
      isActive: req.body?.isActive,
      file: req.file,
    });

    res.status(200).json({
      success: true,
      category,
    });
  }
}
