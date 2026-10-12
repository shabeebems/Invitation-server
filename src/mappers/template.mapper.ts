import { ITemplate } from "../models/template.model";
import { ITheme } from "../models/theme.model";
import { toThemeJson } from "./theme.mapper";
import {
  categoryFrom,
  selectedThemeFrom,
  serializeInvitationContent,
} from "./invitation-content";

export function toTemplateJson(template: ITemplate, themes: ITheme[] = []) {
  const category = categoryFrom(template);
  const selectedTheme = selectedThemeFrom(template);

  return {
    id: String(template._id),
    slug: template.slug,
    name: template.name,
    description: template.description,
    isActive: template.isActive,
    source: "template" as const,
    images: (template.images || []).map((image) => ({
      slot: image.slot,
      url: image.url || "",
      publicId: image.publicId || "",
    })),
    content: serializeInvitationContent(template.content, category.categoryName),
    createdAt: template.createdAt,
    updatedAt: template.updatedAt,
    themes: themes.map(toThemeJson),
    ...category,
    ...selectedTheme,
  };
}
