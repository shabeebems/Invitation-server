import { ITemplate } from "../models/template.model";
import { ITheme } from "../models/theme.model";
import { IWork } from "../models/work.model";
import { toThemeJson } from "./theme.mapper";
import {
  categoryFrom,
  selectedThemeFrom,
  serializeInvitationContent,
} from "./invitation-content";

function templateFrom(work: IWork) {
  const template = work.templateId as unknown;

  if (template && typeof template === "object" && "name" in template) {
    const populated = template as ITemplate;
    return {
      templateId: String(populated._id),
      templateName: populated.name,
      templateSlug: populated.slug,
    };
  }

  return {
    templateId: String(work.templateId || ""),
    templateName: "",
    templateSlug: "",
  };
}

export function toWorkJson(work: IWork, themes: ITheme[] = []) {
  const category = categoryFrom(work);
  const template = templateFrom(work);
  const selectedTheme = selectedThemeFrom(work);

  return {
    id: String(work._id),
    slug: work.slug,
    name: work.name,
    description: work.description,
    isActive: work.isActive,
    source: "work" as const,
    userId:
      work.userId && typeof work.userId === "object" && "_id" in work.userId
        ? String((work.userId as { _id: unknown })._id)
        : String(work.userId || ""),
    images: (work.images || []).map((image) => ({
      slot: image.slot,
      url: image.url || "",
      publicId: image.publicId || "",
    })),
    content: serializeInvitationContent(work.content, category.categoryName),
    createdAt: work.createdAt,
    updatedAt: work.updatedAt,
    themes: themes.map(toThemeJson),
    ...category,
    ...template,
    ...selectedTheme,
  };
}
