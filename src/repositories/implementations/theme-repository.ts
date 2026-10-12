import "reflect-metadata";
import { injectable } from "inversify";
import { Types } from "mongoose";
import { ThemeModel, ITheme } from "../../models/theme.model";
import { TemplateModel, ITemplate } from "../../models/template.model";
import IThemeRepository, { ThemeInput } from "../interfaces/theme-repository.interface";

@injectable()
export default class ThemeRepository implements IThemeRepository {
  async findAll(): Promise<ITheme[]> {
    return ThemeModel.find().sort({ createdAt: 1 });
  }

  async findByTemplateId(templateId: string | Types.ObjectId): Promise<ITheme[]> {
    return ThemeModel.find({ templateId }).sort({ createdAt: 1 });
  }

  async findById(id: string): Promise<ITheme | null> {
    return ThemeModel.findById(id);
  }

  async create(data: ThemeInput): Promise<ITheme> {
    return ThemeModel.create({
      title: data.title,
      templateId: data.templateId,
    });
  }

  async findOrCreate(data: ThemeInput): Promise<ITheme> {
    const existing = await ThemeModel.findOne({
      templateId: data.templateId,
      title: data.title,
    });

    if (existing) {
      return existing;
    }

    return this.create(data);
  }

  async ensureForTemplate(template: ITemplate): Promise<ITemplate> {
    if (template.selectedThemeId) {
      return template;
    }

    const theme = await ThemeModel.findOne({ templateId: template._id }).sort({ createdAt: 1 });

    // Templates with no selectable theme variants keep a single fixed look.
    if (!theme) {
      return template;
    }

    const updated = await TemplateModel.findByIdAndUpdate(
      template._id,
      { selectedThemeId: theme._id },
      { new: true }
    )
      .populate("categoryId", "name")
      .populate("selectedThemeId", "title");

    return updated || template;
  }
}
