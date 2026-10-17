import {
  compactTemplateContent,
  contentFamilyFromCategory,
  ITemplate,
} from "../models/template.model";
import { ICategory } from "../models/category.model";
import { ITheme } from "../models/theme.model";

export function categoryFrom(doc: { categoryId?: unknown }) {
  const category = doc.categoryId as unknown;

  if (category && typeof category === "object" && "name" in category) {
    const populated = category as ICategory;
    return {
      categoryId: String(populated._id),
      categoryName: populated.name,
    };
  }

  return {
    categoryId: String(doc.categoryId || ""),
    categoryName: "",
  };
}

export function selectedThemeFrom(doc: { selectedThemeId?: unknown }) {
  const theme = doc.selectedThemeId as unknown;

  if (theme && typeof theme === "object" && "title" in theme) {
    const populated = theme as ITheme;
    return {
      selectedThemeId: String(populated._id),
      selectedThemeTitle: populated.title,
    };
  }

  return {
    selectedThemeId: String(doc.selectedThemeId || ""),
    selectedThemeTitle: "",
  };
}

export function serializeInvitationContent(
  content: ITemplate["content"] | undefined,
  categoryName: string
) {
  const raw = JSON.parse(JSON.stringify(content || {})) as ITemplate["content"];
  const compacted = compactTemplateContent(raw, contentFamilyFromCategory(categoryName));

  return {
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
    ...(Array.isArray(compacted.loveStoryItems)
      ? {
          loveStoryItems: compacted.loveStoryItems.map((item) => ({
            icon: item.icon || "",
            date: item.date || "",
            place: item.place || "",
            title: item.title || "",
            url: item.url || "",
            publicId: item.publicId || "",
          })),
        }
      : {}),
    ...(Array.isArray(compacted.locationItems)
      ? {
          locationItems: compacted.locationItems.map((item) => ({
            label: item.label || "",
            title: item.title || "",
            address: item.address || "",
            mapsUrl: item.mapsUrl || "",
          })),
        }
      : {}),
    ...(Array.isArray(compacted.enabledSections)
      ? { enabledSections: compacted.enabledSections.filter((id) => typeof id === "string" && id) }
      : {}),
  };
}
