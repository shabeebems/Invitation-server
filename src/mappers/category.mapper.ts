import { ICategory } from "../models/category.model";

export function toCategoryJson(category: ICategory) {
  return {
    id: String(category._id),
    name: category.name,
    description: category.description,
    isActive: category.isActive,
    imageUrl: category.imageUrl || "",
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
}
