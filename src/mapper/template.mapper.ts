import { ICategory } from "../models/category.model";
import {
  compactTemplateContent,
  contentFamilyFromCategory,
  ITemplate,
} from "../models/template.model";
import { ITheme } from "../models/theme.model";
import { toThemeJson } from "./theme.mapper";

function categoryFrom(template: ITemplate) {
  const category = template.categoryId as unknown;

  if (category && typeof category === "object" && "name" in category) {
    const populated = category as ICategory;
    return {
      categoryId: String(populated._id),
      categoryName: populated.name,
    };
  }

  return {
    categoryId: String(template.categoryId || ""),
    categoryName: "",
  };
}

function selectedThemeFrom(template: ITemplate) {
  const theme = template.selectedThemeId as unknown;

  if (theme && typeof theme === "object" && "title" in theme) {
    const populated = theme as ITheme;
    return {
      selectedThemeId: String(populated._id),
      selectedThemeTitle: populated.title,
    };
  }

  return {
    selectedThemeId: String(template.selectedThemeId || ""),
    selectedThemeTitle: "",
  };
}

export function toTemplateJson(template: ITemplate, themes: ITheme[] = []) {
  const category = categoryFrom(template);
  const selectedTheme = selectedThemeFrom(template);
  const raw = JSON.parse(JSON.stringify(template.content || {})) as ITemplate["content"];
  const compacted = compactTemplateContent(raw, contentFamilyFromCategory(category.categoryName));

  return {
    id: String(template._id),
    slug: template.slug,
    name: template.name,
    description: template.description,
    isActive: template.isActive,
    images: (template.images || []).map((image) => ({
      slot: image.slot,
      url: image.url || "",
    })),
    content: {
      ...compacted,
      ...(Array.isArray(compacted.programItems)
        ? {
            programItems: compacted.programItems.map((item) => ({
              time: item.time || "",
              title: item.title || "",
              description: item.description || "",
            })),
          }
        : {}),
      ...(Array.isArray(compacted.galleryItems)
        ? {
            galleryItems: compacted.galleryItems.map((item) => ({
              eyebrow: item.eyebrow || "",
              title: item.title || "",
              caption: item.caption || "",
              url: item.url || "",
              publicId: item.publicId || "",
            })),
          }
        : {}),
    },
    createdAt: template.createdAt,
    updatedAt: template.updatedAt,
    themes: themes.map(toThemeJson),
    ...category,
    ...selectedTheme,
  };
}
