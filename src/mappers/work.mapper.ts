import { ICategory } from "../models/category.model";
import {
  compactTemplateContent,
  contentFamilyFromCategory,
  ITemplate,
} from "../models/template.model";
import { ITheme } from "../models/theme.model";
import { IWork } from "../models/work.model";
import { toThemeJson } from "./theme.mapper";

function categoryFrom(work: IWork) {
  const category = work.categoryId as unknown;

  if (category && typeof category === "object" && "name" in category) {
    const populated = category as ICategory;
    return {
      categoryId: String(populated._id),
      categoryName: populated.name,
    };
  }

  return {
    categoryId: String(work.categoryId || ""),
    categoryName: "",
  };
}

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

function selectedThemeFrom(work: IWork) {
  const theme = work.selectedThemeId as unknown;

  if (theme && typeof theme === "object" && "title" in theme) {
    const populated = theme as ITheme;
    return {
      selectedThemeId: String(populated._id),
      selectedThemeTitle: populated.title,
    };
  }

  return {
    selectedThemeId: String(work.selectedThemeId || ""),
    selectedThemeTitle: "",
  };
}

export function toWorkJson(work: IWork, themes: ITheme[] = []) {
  const category = categoryFrom(work);
  const template = templateFrom(work);
  const selectedTheme = selectedThemeFrom(work);
  const raw = JSON.parse(JSON.stringify(work.content || {})) as IWork["content"];
  const compacted = compactTemplateContent(raw, contentFamilyFromCategory(category.categoryName));

  return {
    id: String(work._id),
    slug: work.slug,
    name: work.name,
    description: work.description,
    isActive: work.isActive,
    source: "work" as const,
    images: (work.images || []).map((image) => ({
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
    createdAt: work.createdAt,
    updatedAt: work.updatedAt,
    themes: themes.map(toThemeJson),
    ...category,
    ...template,
    ...selectedTheme,
  };
}
