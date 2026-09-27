import { toCategoryJson } from "../../mappers/category.mapper";
import { Request } from "express";

export type CategoryJson = ReturnType<typeof toCategoryJson>;

export type CategoryWriteInput = {
  name: unknown;
  description: unknown;
  isActive: unknown;
  file?: Request["file"];
};

export default interface ICategoryService {
  list(): Promise<CategoryJson[]>;
  create(input: CategoryWriteInput): Promise<CategoryJson>;
  update(id: string, input: CategoryWriteInput): Promise<CategoryJson>;
}
