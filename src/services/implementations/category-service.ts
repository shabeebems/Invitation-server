import { inject, injectable } from "inversify";
import { BadRequestError, NotFoundError } from "../../common/errors";
import { guard } from "../../common/helpers/guard";
import { deleteCloudinaryImage, uploadCategoryImage } from "../../config/cloudinary";
import TYPES from "../../constants/types";
import { toCategoryJson } from "../../mappers/category.mapper";
import type ICategoryRepository from "../../repositories/interfaces/category-repository.interface";
import { parseBoolean } from "../../utils/parseBoolean";
import ICategoryService, { CategoryWriteInput } from "../interfaces/category-service.interface";

@injectable()
export default class CategoryService implements ICategoryService {
  constructor(
    @inject(TYPES.ICategoryRepository) private readonly categoryRepository: ICategoryRepository
  ) {}

  async list() {
    return guard("Could not load categories", async () => {
      const categories = await this.categoryRepository.findAll();
      return categories.map(toCategoryJson);
    });
  }

  async create(input: CategoryWriteInput) {
    return guard("Could not create category", async () => {
      const name = String(input.name || "").trim();

      if (!name) {
        throw new BadRequestError("Name is required");
      }

      let imageUrl = "";
      let imagePublicId = "";

      if (input.file) {
        const uploaded = await uploadCategoryImage(input.file);
        imageUrl = uploaded.url;
        imagePublicId = uploaded.publicId;
      }

      const category = await this.categoryRepository.create({
        name,
        description: String(input.description || "").trim(),
        isActive: parseBoolean(input.isActive, true),
        imageUrl,
        imagePublicId,
      });

      return toCategoryJson(category);
    });
  }

  async update(id: string, input: CategoryWriteInput) {
    return guard("Could not update category", async () => {
      const name = String(input.name || "").trim();

      if (!name) {
        throw new BadRequestError("Name is required");
      }

      if (!id) {
        throw new BadRequestError("Category id is required");
      }

      const existing = await this.categoryRepository.findById(id);

      if (!existing) {
        throw new NotFoundError("Category not found");
      }

      const payload: {
        name: string;
        description: string;
        isActive: boolean;
        imageUrl?: string;
        imagePublicId?: string;
      } = {
        name,
        description: String(input.description || "").trim(),
        isActive: parseBoolean(input.isActive, existing.isActive),
      };

      if (input.file) {
        const uploaded = await uploadCategoryImage(input.file);
        payload.imageUrl = uploaded.url;
        payload.imagePublicId = uploaded.publicId;
        await deleteCloudinaryImage(existing.imagePublicId);
      }

      const category = await this.categoryRepository.update(id, payload);
      return toCategoryJson(category!);
    });
  }
}
