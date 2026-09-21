import { CategoryModel, ICategory } from "../models/category.model";

type CategoryInput = {
  name: string;
  description?: string;
  isActive?: boolean;
  imageUrl?: string;
  imagePublicId?: string;
};

export class CategoryRepository {
  async findAll(): Promise<ICategory[]> {
    return CategoryModel.find().sort({ createdAt: -1 });
  }

  async findByName(name: string): Promise<ICategory | null> {
    return CategoryModel.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });
  }

  async findWedding(): Promise<ICategory | null> {
    return CategoryModel.findOne({ name: /wedding/i }).sort({ createdAt: 1 });
  }

  async findHouseWarming(): Promise<ICategory | null> {
    return CategoryModel.findOne({ name: /house\s*warm/i }).sort({ createdAt: 1 });
  }

  async findById(id: string): Promise<ICategory | null> {
    return CategoryModel.findById(id);
  }

  async create(data: CategoryInput): Promise<ICategory> {
    return CategoryModel.create({
      name: data.name,
      description: data.description || "",
      isActive: data.isActive ?? true,
      imageUrl: data.imageUrl || "",
      imagePublicId: data.imagePublicId || "",
    });
  }

  async update(id: string, data: CategoryInput): Promise<ICategory | null> {
    const update: Record<string, unknown> = {
      name: data.name,
      description: data.description || "",
      isActive: data.isActive ?? true,
    };

    if (data.imageUrl !== undefined) {
      update.imageUrl = data.imageUrl;
      update.imagePublicId = data.imagePublicId || "";
    }

    return CategoryModel.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });
  }
}
