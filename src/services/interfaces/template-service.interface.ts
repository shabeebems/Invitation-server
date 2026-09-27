import { toTemplateJson } from "../../mappers/template.mapper";
import { Request } from "express";

export type TemplateJson = ReturnType<typeof toTemplateJson>;

export default interface ITemplateService {
  list(): Promise<TemplateJson[]>;
  show(slug: string): Promise<TemplateJson>;
  update(slug: string, body: unknown, file?: Request["file"]): Promise<TemplateJson | undefined>;
  selectTheme(slug: string, body: unknown): Promise<TemplateJson | undefined>;
}
