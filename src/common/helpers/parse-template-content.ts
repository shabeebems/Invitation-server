import {
  IGalleryItem,
  IProgramItem,
  ITemplateContent,
  TEMPLATE_CONTENT_KEYS,
} from "../../models/template.model";

export function parseTemplateContent(raw: unknown): Partial<ITemplateContent> {
  let parsed = raw;

  if (typeof raw === "string" && raw.trim()) {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return {};
    }
  }

  if (!parsed || typeof parsed !== "object") {
    return {};
  }

  const source = parsed as Record<string, unknown>;
  const content: Partial<ITemplateContent> = {};

  for (const key of TEMPLATE_CONTENT_KEYS) {
    if (typeof source[key] === "string") {
      content[key] = source[key];
    }
  }

  if (Array.isArray(source.programItems)) {
    content.programItems = source.programItems.map((item) => {
      const row = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
      return {
        time: typeof row.time === "string" ? row.time : "",
        title: typeof row.title === "string" ? row.title : "",
        description: typeof row.description === "string" ? row.description : "",
      } satisfies IProgramItem;
    });
  }

  if (Array.isArray(source.galleryItems)) {
    content.galleryItems = source.galleryItems.map((item) => {
      const row = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
      return {
        eyebrow: typeof row.eyebrow === "string" ? row.eyebrow : "",
        title: typeof row.title === "string" ? row.title : "",
        caption: typeof row.caption === "string" ? row.caption : "",
        url: typeof row.url === "string" && !row.url.startsWith("blob:") ? row.url : "",
        publicId: typeof row.publicId === "string" ? row.publicId : "",
      } satisfies IGalleryItem;
    });
  }

  return content;
}

export function categoryNameFrom(record: { categoryId?: unknown }): string {
  const category = record.categoryId;

  if (category && typeof category === "object" && "name" in category) {
    return String((category as { name: string }).name);
  }

  return "";
}

export function requestBody(body: unknown): Record<string, unknown> {
  if (body && typeof body === "object") {
    return body as Record<string, unknown>;
  }

  return {};
}
