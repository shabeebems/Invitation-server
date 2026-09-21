import { Request, Response } from "express";
import { Types } from "mongoose";
import {
  ITemplate,
  ITemplateContent,
  IProgramItem,
  IGalleryItem,
  TEMPLATE_CONTENT_KEYS,
  compactTemplateContent,
  contentFamilyFromCategory,
  findTemplateImage,
  upsertTemplateImage,
} from "../models/template.model";
import { ITheme } from "../models/theme.model";
import { TemplateRepository } from "../repositories/template.repository";
import { ThemeRepository } from "../repositories/theme.repository";
import { toTemplateJson } from "../mapper/template.mapper";
import { deleteCloudinaryImage, uploadTemplateImage } from "../config/cloudinary";

const templateRepository = new TemplateRepository();
const themeRepository = new ThemeRepository();

function categoryNameFrom(template: ITemplate) {
  const category = template.categoryId as unknown;

  if (category && typeof category === "object" && "name" in category) {
    return String((category as { name: string }).name);
  }

  return "";
}

function parseContent(raw: unknown): Partial<ITemplateContent> {
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

function groupThemes(themes: ITheme[]) {
  const grouped = new Map<string, ITheme[]>();

  for (const theme of themes) {
    const key = String(theme.templateId);
    const list = grouped.get(key) || [];
    list.push(theme);
    grouped.set(key, list);
  }

  return grouped;
}

async function withThemes(templates: ITemplate[]) {
  const ensured: ITemplate[] = [];

  for (const template of templates) {
    ensured.push(await themeRepository.ensureForTemplate(template));
  }

  const grouped = groupThemes(await themeRepository.findAll());

  return ensured.map((template) =>
    toTemplateJson(template, grouped.get(String(template._id)) || [])
  );
}

export class TemplateController {
  async list(_req: Request, res: Response): Promise<void> {
    try {
      const templates = await withThemes(await templateRepository.findAll());

      res.status(200).json({
        success: true,
        templates,
      });
    } catch {
      res.status(500).json({
        success: false,
        message: "Could not load templates",
      });
    }
  }

  async show(req: Request, res: Response): Promise<void> {
    try {
      const slug = String(req.params.slug || "").trim();

      if (!slug) {
        res.status(400).json({
          success: false,
          message: "Template slug is required",
        });
        return;
      }

      const template = await templateRepository.findBySlug(slug);

      if (!template) {
        res.status(404).json({
          success: false,
          message: "Template not found",
        });
        return;
      }

      const [json] = await withThemes([template]);

      res.status(200).json({
        success: true,
        template: json,
      });
    } catch {
      res.status(500).json({
        success: false,
        message: "Could not load template",
      });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const slug = String(req.params.slug || "").trim();

      if (!slug) {
        res.status(400).json({
          success: false,
          message: "Template slug is required",
        });
        return;
      }

      const existing = await templateRepository.findBySlug(slug);

      if (!existing) {
        res.status(404).json({
          success: false,
          message: "Template not found",
        });
        return;
      }

      const patch = parseContent(req.body?.content);
      const currentContent = JSON.parse(JSON.stringify(existing.content || {})) as ITemplateContent;
      const content: ITemplateContent = { ...currentContent, ...patch };

      if (patch.galleryItems) {
        const previousItems = currentContent.galleryItems || [];
        content.galleryItems = patch.galleryItems.map((item, index) => ({
          eyebrow: item.eyebrow || "",
          title: item.title || "",
          caption: item.caption || "",
          url: item.url || previousItems[index]?.url || "",
          publicId: item.publicId || previousItems[index]?.publicId || "",
        }));

        const nextIds = new Set(content.galleryItems.map((item) => item.publicId).filter(Boolean));
        for (const item of previousItems) {
          if (item.publicId && !nextIds.has(item.publicId)) {
            await deleteCloudinaryImage(item.publicId);
          }
        }
      }

      const payload: {
        content: ITemplateContent;
        images?: { slot: string; url: string; publicId: string }[];
      } = { content };

      if (req.file) {
        const uploaded = await uploadTemplateImage(req.file);
        const slot = String(req.body?.imageSlot || "hero").trim() || "hero";

        if (slot === "gallery") {
          const index = Number(req.body?.galleryIndex);
          const items = [...(content.galleryItems || [])];

          if (Number.isInteger(index) && index >= 0 && index < items.length) {
            const previous = items[index];
            items[index] = {
              ...items[index],
              url: uploaded.url,
              publicId: uploaded.publicId,
            };
            payload.content = { ...content, galleryItems: items };
            await deleteCloudinaryImage(previous?.publicId);
          }
        } else {
          const current = (existing.images || []).map((image) => ({
            slot: image.slot,
            url: image.url,
            publicId: image.publicId,
          }));
          const previous = findTemplateImage(current, slot);
          payload.images = upsertTemplateImage(current, slot, uploaded.url, uploaded.publicId);
          await deleteCloudinaryImage(previous?.publicId);
        }
      }

      payload.content = compactTemplateContent(
        payload.content,
        contentFamilyFromCategory(categoryNameFrom(existing))
      ) as ITemplateContent;

      const template = await templateRepository.updateBySlug(slug, payload);
      const [json] = template ? await withThemes([template]) : [];

      res.status(200).json({
        success: true,
        template: json,
      });
    } catch {
      res.status(500).json({
        success: false,
        message: "Could not update template",
      });
    }
  }

  async selectTheme(req: Request, res: Response): Promise<void> {
    try {
      const slug = String(req.params.slug || "").trim();
      const selectedThemeId = String(req.body?.selectedThemeId || "").trim();

      if (!slug) {
        res.status(400).json({
          success: false,
          message: "Template slug is required",
        });
        return;
      }

      if (!selectedThemeId || !Types.ObjectId.isValid(selectedThemeId)) {
        res.status(400).json({
          success: false,
          message: "A valid selectedThemeId is required",
        });
        return;
      }

      const template = await templateRepository.findBySlug(slug);

      if (!template) {
        res.status(404).json({
          success: false,
          message: "Template not found",
        });
        return;
      }

      const theme = await themeRepository.findById(selectedThemeId);

      if (!theme || String(theme.templateId) !== String(template._id)) {
        res.status(400).json({
          success: false,
          message: "Theme does not belong to this template",
        });
        return;
      }

      const updated = await templateRepository.updateSelectedTheme(
        String(template._id),
        selectedThemeId
      );
      const [json] = updated ? await withThemes([updated]) : [];

      res.status(200).json({
        success: true,
        template: json,
      });
    } catch {
      res.status(500).json({
        success: false,
        message: "Could not change theme",
      });
    }
  }
}
