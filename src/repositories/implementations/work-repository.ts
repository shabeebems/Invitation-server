import "reflect-metadata";
import { injectable } from "inversify";
import { WorkModel, IWork } from "../../models/work.model";
import "../../models/theme.model";
import "../../models/category.model";
import "../../models/template.model";
import IWorkRepository, { WorkInput, WorkUpdate } from "../interfaces/work-repository.interface";

const populatePaths = [
  { path: "categoryId", select: "name" },
  { path: "templateId", select: "name slug" },
  { path: "selectedThemeId", select: "title" },
] as const;

@injectable()
export default class WorkRepository implements IWorkRepository {
  async findAll(): Promise<IWork[]> {
    return WorkModel.find()
      .populate([...populatePaths])
      .sort({ createdAt: -1 });
  }

  async findByUserId(userId: string): Promise<IWork[]> {
    return WorkModel.find({ userId })
      .populate([...populatePaths])
      .sort({ createdAt: -1 });
  }

  async findBySlug(slug: string): Promise<IWork | null> {
    return WorkModel.findOne({ slug: slug.toLowerCase() }).populate([...populatePaths]);
  }

  async slugExists(slug: string): Promise<boolean> {
    const existing = await WorkModel.exists({ slug: slug.toLowerCase() });
    return Boolean(existing);
  }

  async create(data: WorkInput): Promise<IWork> {
    const created = await WorkModel.create({
      slug: data.slug,
      name: data.name,
      description: data.description || "",
      userId: data.userId || null,
      categoryId: data.categoryId,
      templateId: data.templateId,
      selectedThemeId: data.selectedThemeId || null,
      isActive: data.isActive ?? true,
      images: data.images || [],
      content: data.content || {},
    });

    return created.populate([...populatePaths]);
  }

  async updateBySlug(slug: string, data: WorkUpdate): Promise<IWork | null> {
    const update: Record<string, unknown> = {};

    if (data.name !== undefined) {
      update.name = data.name;
    }

    if (data.content) {
      update.content = data.content;
    }

    if (data.images) {
      update.images = data.images;
    }

    if (data.selectedThemeId !== undefined) {
      update.selectedThemeId = data.selectedThemeId;
    }

    return WorkModel.findOneAndUpdate(
      { slug: slug.toLowerCase() },
      { $set: update },
      { new: true, runValidators: true }
    ).populate([...populatePaths]);
  }

  async updateSelectedTheme(id: string, selectedThemeId: string): Promise<IWork | null> {
    return WorkModel.findByIdAndUpdate(
      id,
      { selectedThemeId },
      { new: true, runValidators: true }
    ).populate([...populatePaths]);
  }
}
