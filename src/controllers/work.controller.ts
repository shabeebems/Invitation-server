import { Request, Response } from "express";
import { Types } from "mongoose";
import {
  IGalleryItem,
  IProgramItem,
  ITemplate,
  ITemplateContent,
  TEMPLATE_CONTENT_KEYS,
  compactTemplateContent,
  contentFamilyFromCategory,
  findTemplateImage,
  upsertTemplateImage,
} from "../models/template.model";
import { IWork } from "../models/work.model";
import { ITheme } from "../models/theme.model";
import { CategoryRepository } from "../repositories/category.repository";
import { TemplateRepository } from "../repositories/template.repository";
import { ThemeRepository } from "../repositories/theme.repository";
import { WorkRepository } from "../repositories/work.repository";
import { toWorkJson } from "../mapper/work.mapper";
import {
  deleteCloudinaryImage,
  isWorkCloudinaryId,
  uploadImageFromUrl,
  uploadWorkImage,
  WORK_IMAGE_FOLDER,
} from "../config/cloudinary";

const workRepository = new WorkRepository();
const templateRepository = new TemplateRepository();
const categoryRepository = new CategoryRepository();
const themeRepository = new ThemeRepository();

function categoryNameFrom(work: IWork) {
  const category = work.categoryId as unknown;

  if (category && typeof category === "object" && "name" in category) {
    return String((category as { name: string }).name);
  }

  return "";
}

function idOf(ref: unknown): string {
  if (ref && typeof ref === "object" && "_id" in ref) {
    return String((ref as { _id: unknown })._id);
  }

  return String(ref || "");
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

async function cloneImage(url: string, publicId: string) {
  if (!url) {
    return { url: "", publicId: "" };
  }

  try {
    return await uploadImageFromUrl(url, WORK_IMAGE_FOLDER);
  } catch {
    return { url, publicId: isWorkCloudinaryId(publicId) ? publicId : "" };
  }
}

async function snapshotFromTemplate(template: ITemplate) {
  const images = await Promise.all(
    (template.images || []).map(async (image) => {
      const cloned = await cloneImage(image.url, image.publicId);
      return {
        slot: image.slot,
        url: cloned.url,
        publicId: cloned.publicId,
      };
    })
  );

  const content = JSON.parse(JSON.stringify(template.content || {})) as ITemplateContent;

  if (Array.isArray(content.galleryItems)) {
    content.galleryItems = await Promise.all(
      content.galleryItems.map(async (item) => {
        const cloned = await cloneImage(item.url, item.publicId);
        return {
          ...item,
          url: cloned.url,
          publicId: cloned.publicId,
        };
      })
    );
  }

  return { images, content };
}

const RESERVED_SLUGS = new Set([
  "dashboard",
  "categories",
  "templates",
  "works",
  "users",
  "preview",
  "api",
]);

function slugFromName(name: string) {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function slugIsTaken(slug: string) {
  return RESERVED_SLUGS.has(slug) || workRepository.slugExists(slug);
}

async function uniqueWorkSlug(name: string) {
  const base = slugFromName(name) || "work";

  if (!(await slugIsTaken(base))) {
    return base;
  }

  for (let suffix = 2; suffix < 1000; suffix += 1) {
    const slug = `${base}${suffix}`;
    if (!(await slugIsTaken(slug))) {
      return slug;
    }
  }

  return `${base}${Date.now()}`;
}

async function deleteWorkAsset(publicId?: string) {
  if (isWorkCloudinaryId(publicId)) {
    await deleteCloudinaryImage(publicId);
  }
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

async function withThemes(works: IWork[]) {
  const grouped = groupThemes(await themeRepository.findAll());

  return works.map((work) => toWorkJson(work, grouped.get(idOf(work.templateId)) || []));
}

function invitationPayload(json: ReturnType<typeof toWorkJson>) {
  return {
    success: true,
    work: json,
    template: json,
  };
}

export class WorkController {
  async list(_req: Request, res: Response): Promise<void> {
    try {
      const works = await withThemes(await workRepository.findAll());

      res.status(200).json({
        success: true,
        works,
      });
    } catch {
      res.status(500).json({
        success: false,
        message: "Could not load works",
      });
    }
  }

  async show(req: Request, res: Response): Promise<void> {
    try {
      const slug = String(req.params.slug || "").trim();

      if (!slug) {
        res.status(400).json({
          success: false,
          message: "Work slug is required",
        });
        return;
      }

      const work = await workRepository.findBySlug(slug);

      if (!work) {
        res.status(404).json({
          success: false,
          message: "Work not found",
        });
        return;
      }

      const [json] = await withThemes([work]);

      res.status(200).json(invitationPayload(json));
    } catch {
      res.status(500).json({
        success: false,
        message: "Could not load work",
      });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const categoryId = String(req.body?.categoryId || "").trim();
      const templateId = String(req.body?.templateId || "").trim();
      const name = String(req.body?.name || "").trim();

      if (!name) {
        res.status(400).json({
          success: false,
          message: "Name is required",
        });
        return;
      }

      if (!Types.ObjectId.isValid(categoryId) || !Types.ObjectId.isValid(templateId)) {
        res.status(400).json({
          success: false,
          message: "A valid category and template are required",
        });
        return;
      }

      const category = await categoryRepository.findById(categoryId);

      if (!category) {
        res.status(404).json({
          success: false,
          message: "Category not found",
        });
        return;
      }

      const template = await templateRepository.findById(templateId);

      if (!template) {
        res.status(404).json({
          success: false,
          message: "Template not found",
        });
        return;
      }

      if (idOf(template.categoryId) !== categoryId) {
        res.status(400).json({
          success: false,
          message: "Template does not belong to this category",
        });
        return;
      }

      const snapshot = await snapshotFromTemplate(template);
      const family = contentFamilyFromCategory(category.name);
      const slug = await uniqueWorkSlug(name);

      const work = await workRepository.create({
        slug,
        name,
        description: template.description,
        categoryId,
        templateId,
        selectedThemeId: template.selectedThemeId ? idOf(template.selectedThemeId) : null,
        images: snapshot.images,
        content: compactTemplateContent(snapshot.content, family) as ITemplateContent,
      });

      const [json] = await withThemes([work]);

      res.status(201).json(invitationPayload(json));
    } catch {
      res.status(500).json({
        success: false,
        message: "Could not create work",
      });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const slug = String(req.params.slug || "").trim();

      if (!slug) {
        res.status(400).json({
          success: false,
          message: "Work slug is required",
        });
        return;
      }

      const existing = await workRepository.findBySlug(slug);

      if (!existing) {
        res.status(404).json({
          success: false,
          message: "Work not found",
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
            await deleteWorkAsset(item.publicId);
          }
        }
      }

      const payload: {
        content: ITemplateContent;
        images?: { slot: string; url: string; publicId: string }[];
      } = { content };

      if (req.file) {
        const uploaded = await uploadWorkImage(req.file);
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
            await deleteWorkAsset(previous?.publicId);
          }
        } else {
          const current = (existing.images || []).map((image) => ({
            slot: image.slot,
            url: image.url,
            publicId: image.publicId,
          }));
          const previous = findTemplateImage(current, slot);
          payload.images = upsertTemplateImage(current, slot, uploaded.url, uploaded.publicId);
          await deleteWorkAsset(previous?.publicId);
        }
      }

      payload.content = compactTemplateContent(
        payload.content,
        contentFamilyFromCategory(categoryNameFrom(existing))
      ) as ITemplateContent;

      const work = await workRepository.updateBySlug(slug, payload);
      const [json] = work ? await withThemes([work]) : [];

      res.status(200).json(invitationPayload(json));
    } catch {
      res.status(500).json({
        success: false,
        message: "Could not update work",
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
          message: "Work slug is required",
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

      const work = await workRepository.findBySlug(slug);

      if (!work) {
        res.status(404).json({
          success: false,
          message: "Work not found",
        });
        return;
      }

      const theme = await themeRepository.findById(selectedThemeId);

      if (!theme || String(theme.templateId) !== idOf(work.templateId)) {
        res.status(400).json({
          success: false,
          message: "Theme does not belong to this work's template",
        });
        return;
      }

      const updated = await workRepository.updateSelectedTheme(String(work._id), selectedThemeId);
      const [json] = updated ? await withThemes([updated]) : [];

      res.status(200).json(invitationPayload(json));
    } catch {
      res.status(500).json({
        success: false,
        message: "Could not change theme",
      });
    }
  }
}
