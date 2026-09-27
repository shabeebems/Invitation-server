import { Types } from "mongoose";
import { ITemplate, ITemplateContent, ITemplateImage } from "../../models/template.model";

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

export default interface ITemplateRepository {
  findAll(): Promise<ITemplate[]>;
  findBySlug(slug: string): Promise<ITemplate | null>;
  findById(id: string): Promise<ITemplate | null>;
  create(data: TemplateInput): Promise<ITemplate>;
  upsertBySlug(data: TemplateInput): Promise<ITemplate>;
  updateBySlug(slug: string, data: TemplateUpdate): Promise<ITemplate | null>;
  updateSelectedTheme(id: string, selectedThemeId: string): Promise<ITemplate | null>;
}
