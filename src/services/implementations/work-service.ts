import { Request } from "express";
import { inject, injectable } from "inversify";
import { Types } from "mongoose";
import { BadRequestError, ForbiddenError, NotFoundError } from "../../common/errors";
import { groupThemes } from "../../common/helpers/group-themes";
import { guard } from "../../common/helpers/guard";
import {
  categoryNameFrom,
  parseTemplateContent,
  requestBody,
} from "../../common/helpers/parse-template-content";
import {
  deleteCloudinaryImage,
  isWorkCloudinaryId,
  uploadImageFromUrl,
  uploadWorkImage,
  WORK_IMAGE_FOLDER,
} from "../../config/cloudinary";
import TYPES from "../../constants/types";
import { toWorkJson } from "../../mappers/work.mapper";
import {
  ITemplate,
  ITemplateContent,
  compactTemplateContent,
  contentFamilyFromCategory,
  findTemplateImage,
  upsertTemplateImage,
} from "../../models/template.model";
import { IWork } from "../../models/work.model";
import type ICategoryRepository from "../../repositories/interfaces/category-repository.interface";
import type ITemplateRepository from "../../repositories/interfaces/template-repository.interface";
import type IThemeRepository from "../../repositories/interfaces/theme-repository.interface";
import type IWorkRepository from "../../repositories/interfaces/work-repository.interface";
import IWorkService, { WorkActor } from "../interfaces/work-service.interface";

const RESERVED_SLUGS = new Set([
  "dashboard",
  "categories",
  "templates",
  "works",
  "users",
  "preview",
  "api",
  "account",
  "use",
  "login",
  "signup",
  "profile",
  "admin",
  "published",
]);

@injectable()
export default class WorkService implements IWorkService {
  constructor(
    @inject(TYPES.IWorkRepository) private readonly workRepository: IWorkRepository,
    @inject(TYPES.ITemplateRepository) private readonly templateRepository: ITemplateRepository,
    @inject(TYPES.ICategoryRepository) private readonly categoryRepository: ICategoryRepository,
    @inject(TYPES.IThemeRepository) private readonly themeRepository: IThemeRepository
  ) {}

  async list(actor: WorkActor) {
    return guard("Could not load works", async () => {
      const works =
        actor.role === "admin"
          ? await this.workRepository.findAll()
          : await this.workRepository.findByUserId(actor.userId);

      return this.withThemes(works);
    });
  }

  async show(slug: string) {
    return guard("Could not load work", async () => {
      const normalized = slug.trim();

      if (!normalized) {
        throw new BadRequestError("Work slug is required");
      }

      const work = await this.workRepository.findBySlug(normalized);

      if (!work) {
        throw new NotFoundError("Work not found");
      }

      const [json] = await this.withThemes([work]);
      return json;
    });
  }

  async create(body: unknown, userId: string) {
    return guard("Could not create work", async () => {
      const fields = requestBody(body);
      const categoryId = String(fields.categoryId || "").trim();
      const templateId = String(fields.templateId || "").trim();
      const name = String(fields.name || "").trim();

      if (!name) {
        throw new BadRequestError("Name is required");
      }

      if (!Types.ObjectId.isValid(categoryId) || !Types.ObjectId.isValid(templateId)) {
        throw new BadRequestError("A valid category and template are required");
      }

      const category = await this.categoryRepository.findById(categoryId);

      if (!category) {
        throw new NotFoundError("Category not found");
      }

      const template = await this.templateRepository.findById(templateId);

      if (!template) {
        throw new NotFoundError("Template not found");
      }

      if (this.idOf(template.categoryId) !== categoryId) {
        throw new BadRequestError("Template does not belong to this category");
      }

      const snapshot = await this.snapshotFromTemplate(template);
      const family = contentFamilyFromCategory(category.name);
      const details = parseTemplateContent(fields.details ?? fields.content);
      const slug = await this.uniqueWorkSlug(name);
      const selectedThemeId = await this.themeForTemplate(
        templateId,
        String(fields.selectedThemeId || "").trim() ||
          (template.selectedThemeId ? this.idOf(template.selectedThemeId) : "")
      );

      const work = await this.workRepository.create({
        slug,
        name,
        description: template.description,
        userId,
        categoryId,
        templateId,
        selectedThemeId,
        images: snapshot.images,
        content: compactTemplateContent({ ...snapshot.content, ...details }, family) as ITemplateContent,
      });

      const [json] = await this.withThemes([work]);
      return json;
    });
  }

  async update(slug: string, body: unknown, actor: WorkActor, file?: Request["file"]) {
    return guard("Could not update work", async () => {
      const normalized = slug.trim();

      if (!normalized) {
        throw new BadRequestError("Work slug is required");
      }

      const existing = await this.workRepository.findBySlug(normalized);

      if (!existing) {
        throw new NotFoundError("Work not found");
      }

      this.assertCanMutate(existing, actor);

      const fields = requestBody(body);
      const patch = parseTemplateContent(fields.content);
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
            await this.deleteWorkAsset(item.publicId);
          }
        }
      }

      const payload: {
        content: ITemplateContent;
        images?: { slot: string; url: string; publicId: string }[];
      } = { content };

      if (file) {
        const uploaded = await uploadWorkImage(file);
        const slot = String(fields.imageSlot || "hero").trim() || "hero";

        if (slot === "gallery") {
          const index = Number(fields.galleryIndex);
          const items = [...(content.galleryItems || [])];

          if (Number.isInteger(index) && index >= 0 && index < items.length) {
            const previous = items[index];
            items[index] = {
              ...items[index],
              url: uploaded.url,
              publicId: uploaded.publicId,
            };
            payload.content = { ...content, galleryItems: items };
            await this.deleteWorkAsset(previous?.publicId);
          }
        } else {
          const current = (existing.images || []).map((image) => ({
            slot: image.slot,
            url: image.url,
            publicId: image.publicId,
          }));
          const previous = findTemplateImage(current, slot);
          payload.images = upsertTemplateImage(current, slot, uploaded.url, uploaded.publicId);
          await this.deleteWorkAsset(previous?.publicId);
        }
      }

      payload.content = compactTemplateContent(
        payload.content,
        contentFamilyFromCategory(categoryNameFrom(existing))
      ) as ITemplateContent;

      const work = await this.workRepository.updateBySlug(normalized, payload);
      const [json] = work ? await this.withThemes([work]) : [];
      return json;
    });
  }

  async selectTheme(slug: string, body: unknown, actor: WorkActor) {
    return guard("Could not change theme", async () => {
      const normalized = slug.trim();
      const selectedThemeId = String(requestBody(body).selectedThemeId || "").trim();

      if (!normalized) {
        throw new BadRequestError("Work slug is required");
      }

      if (!selectedThemeId || !Types.ObjectId.isValid(selectedThemeId)) {
        throw new BadRequestError("A valid selectedThemeId is required");
      }

      const work = await this.workRepository.findBySlug(normalized);

      if (!work) {
        throw new NotFoundError("Work not found");
      }

      this.assertCanMutate(work, actor);

      const theme = await this.themeRepository.findById(selectedThemeId);

      if (!theme || String(theme.templateId) !== this.idOf(work.templateId)) {
        throw new BadRequestError("Theme does not belong to this work's template");
      }

      const updated = await this.workRepository.updateSelectedTheme(String(work._id), selectedThemeId);
      const [json] = updated ? await this.withThemes([updated]) : [];
      return json;
    });
  }

  private async themeForTemplate(templateId: string, selectedThemeId: string) {
    if (!selectedThemeId) {
      return null;
    }

    if (!Types.ObjectId.isValid(selectedThemeId)) {
      throw new BadRequestError("A valid theme is required");
    }

    const theme = await this.themeRepository.findById(selectedThemeId);

    if (!theme || this.idOf(theme.templateId) !== templateId) {
      throw new BadRequestError("Theme does not belong to this template");
    }

    return selectedThemeId;
  }

  private assertCanMutate(work: IWork, actor: WorkActor) {
    if (actor.role === "admin") {
      return;
    }

    if (this.idOf(work.userId) !== actor.userId) {
      throw new ForbiddenError("You can only edit your own invitations");
    }
  }

  private async withThemes(works: IWork[]) {
    const grouped = groupThemes(await this.themeRepository.findAll());

    return works.map((work) => toWorkJson(work, grouped.get(this.idOf(work.templateId)) || []));
  }

  private idOf(ref: unknown): string {
    if (ref && typeof ref === "object" && "_id" in ref) {
      return String((ref as { _id: unknown })._id);
    }

    return String(ref || "");
  }

  private async cloneImage(url: string, publicId: string) {
    if (!url) {
      return { url: "", publicId: "" };
    }

    try {
      return await uploadImageFromUrl(url, WORK_IMAGE_FOLDER);
    } catch {
      return { url, publicId: isWorkCloudinaryId(publicId) ? publicId : "" };
    }
  }

  private async snapshotFromTemplate(template: ITemplate) {
    const images = await Promise.all(
      (template.images || []).map(async (image) => {
        const cloned = await this.cloneImage(image.url, image.publicId);
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
          const cloned = await this.cloneImage(item.url, item.publicId);
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

  private slugFromName(name: string) {
    return name
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  private async slugIsTaken(slug: string) {
    return RESERVED_SLUGS.has(slug) || this.workRepository.slugExists(slug);
  }

  private async uniqueWorkSlug(name: string) {
    const base = this.slugFromName(name) || "work";

    if (!(await this.slugIsTaken(base))) {
      return base;
    }

    for (let suffix = 2; suffix < 1000; suffix += 1) {
      const slug = `${base}${suffix}`;
      if (!(await this.slugIsTaken(slug))) {
        return slug;
      }
    }

    return `${base}${Date.now()}`;
  }

  private async deleteWorkAsset(publicId?: string) {
    if (isWorkCloudinaryId(publicId)) {
      await deleteCloudinaryImage(publicId);
    }
  }
}
