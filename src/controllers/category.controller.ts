import { Request, Response } from "express";
import { CategoryRepository } from "../repositories/category.repository";
import { toCategoryJson } from "../mapper/category.mapper";
import { deleteCloudinaryImage, uploadCategoryImage } from "../config/cloudinary";
import { parseBoolean } from "../utils/parseBoolean";

const categoryRepository = new CategoryRepository();

export class CategoryController {
  async list(_req: Request, res: Response): Promise<void> {
    try {
      const categories = await categoryRepository.findAll();

      res.status(200).json({
        success: true,
        categories: categories.map(toCategoryJson),
      });
    } catch {
      res.status(500).json({
        success: false,
        message: "Could not load categories",
      });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const name = String(req.body?.name || "").trim();

      if (!name) {
        res.status(400).json({
          success: false,
          message: "Name is required",
        });
        return;
      }

      let imageUrl = "";
      let imagePublicId = "";

      if (req.file) {
        const uploaded = await uploadCategoryImage(req.file);
        imageUrl = uploaded.url;
        imagePublicId = uploaded.publicId;
      }

      const category = await categoryRepository.create({
        name,
        description: String(req.body?.description || "").trim(),
        isActive: parseBoolean(req.body?.isActive, true),
        imageUrl,
        imagePublicId,
      });

      res.status(201).json({
        success: true,
        category: toCategoryJson(category),
      });
    } catch {
      res.status(500).json({
        success: false,
        message: "Could not create category",
      });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const name = String(req.body?.name || "").trim();

      if (!name) {
        res.status(400).json({
          success: false,
          message: "Name is required",
        });
        return;
      }

      const id = String(req.params.id || "");

      if (!id) {
        res.status(400).json({
          success: false,
          message: "Category id is required",
        });
        return;
      }

      const existing = await categoryRepository.findById(id);

      if (!existing) {
        res.status(404).json({
          success: false,
          message: "Category not found",
        });
        return;
      }

      const payload: {
        name: string;
        description: string;
        isActive: boolean;
        imageUrl?: string;
        imagePublicId?: string;
      } = {
        name,
        description: String(req.body?.description || "").trim(),
        isActive: parseBoolean(req.body?.isActive, existing.isActive),
      };

      if (req.file) {
        const uploaded = await uploadCategoryImage(req.file);
        payload.imageUrl = uploaded.url;
        payload.imagePublicId = uploaded.publicId;
        await deleteCloudinaryImage(existing.imagePublicId);
      }

      const category = await categoryRepository.update(id, payload);

      res.status(200).json({
        success: true,
        category: toCategoryJson(category!),
      });
    } catch {
      res.status(500).json({
        success: false,
        message: "Could not update category",
      });
    }
  }
}
