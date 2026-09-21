import { Types } from "mongoose";
import { TemplateModel, ITemplate, ITemplateContent, ITemplateImage } from "../models/template.model";
import "../models/theme.model";

export type TemplateInput = {
  slug: string;
  name: string;
  description?: string;
  categoryId: string | Types.ObjectId;
  isActive?: boolean;
  selectedThemeId?: string | Types.ObjectId | null;
  images?: ITemplateImage[];
  content?: Partial<ITemplateContent>;
};

export type TemplateUpdate = {
  content?: Partial<ITemplateContent>;
  selectedThemeId?: string | Types.ObjectId;
  images?: ITemplateImage[];
};

export class TemplateRepository {
  async findAll(): Promise<ITemplate[]> {
    return TemplateModel.find()
      .populate("categoryId", "name")
      .populate("selectedThemeId", "title")
      .sort({ createdAt: -1 });
  }

  async findBySlug(slug: string): Promise<ITemplate | null> {
    return TemplateModel.findOne({ slug: slug.toLowerCase() })
      .populate("categoryId", "name")
      .populate("selectedThemeId", "title");
  }

  async findById(id: string): Promise<ITemplate | null> {
    return TemplateModel.findById(id)
      .populate("categoryId", "name")
      .populate("selectedThemeId", "title");
  }

  async create(data: TemplateInput): Promise<ITemplate> {
    const created = await TemplateModel.create({
      slug: data.slug,
      name: data.name,
      description: data.description || "",
      categoryId: data.categoryId,
      isActive: data.isActive ?? true,
      images: data.images || [],
      content: data.content || {},
    });

    return created.populate([{ path: "categoryId", select: "name" }, { path: "selectedThemeId", select: "title" }]);
  }

  async upsertBySlug(data: TemplateInput): Promise<ITemplate> {
    const template = await TemplateModel.findOneAndUpdate(
      { slug: data.slug.toLowerCase() },
      {
        slug: data.slug.toLowerCase(),
        name: data.name,
        description: data.description || "",
        categoryId: data.categoryId,
        isActive: data.isActive ?? true,
        images: data.images || [],
        content: data.content || {},
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    return template.populate([{ path: "categoryId", select: "name" }, { path: "selectedThemeId", select: "title" }]);
  }

  async updateBySlug(slug: string, data: TemplateUpdate): Promise<ITemplate | null> {
    const update: Record<string, unknown> = {};

    if (data.content) {
      update.content = data.content;
    }

    if (data.images) {
      update.images = data.images;
    }

    if (data.selectedThemeId !== undefined) {
      update.selectedThemeId = data.selectedThemeId;
    }

    return TemplateModel.findOneAndUpdate(
      { slug: slug.toLowerCase() },
      { $set: update },
      { new: true, runValidators: true }
    )
      .populate("categoryId", "name")
      .populate("selectedThemeId", "title");
  }

  async updateSelectedTheme(id: string, selectedThemeId: string): Promise<ITemplate | null> {
    return TemplateModel.findByIdAndUpdate(
      id,
      { selectedThemeId },
      { new: true, runValidators: true }
    )
      .populate("categoryId", "name")
      .populate("selectedThemeId", "title");
  }
}
