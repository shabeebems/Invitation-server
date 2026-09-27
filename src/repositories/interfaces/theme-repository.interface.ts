import { Types } from "mongoose";
import { ITheme } from "../../models/theme.model";
import { ITemplate } from "../../models/template.model";

export type ThemeInput = {
  title: string;
  templateId: string | Types.ObjectId;
};

export default interface IThemeRepository {
  findAll(): Promise<ITheme[]>;
  findByTemplateId(templateId: string | Types.ObjectId): Promise<ITheme[]>;
  findById(id: string): Promise<ITheme | null>;
  create(data: ThemeInput): Promise<ITheme>;
  findOrCreate(data: ThemeInput): Promise<ITheme>;
  ensureForTemplate(template: ITemplate): Promise<ITemplate>;
}
