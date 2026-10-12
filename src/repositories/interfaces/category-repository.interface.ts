import { ICategory } from "../../models/category.model";

export type CategoryInput = {
  name: string;
  description?: string;
  isActive?: boolean;
  imageUrl?: string;
  imagePublicId?: string;
};

export default interface ICategoryRepository {
  findAll(): Promise<ICategory[]>;
  findByName(name: string): Promise<ICategory | null>;
  findWedding(): Promise<ICategory | null>;
  findHouseWarming(): Promise<ICategory | null>;
  findById(id: string): Promise<ICategory | null>;
  create(data: CategoryInput): Promise<ICategory>;
  update(id: string, data: CategoryInput): Promise<ICategory | null>;
}
