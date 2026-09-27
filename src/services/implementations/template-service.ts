import { Request } from "express";
import { inject, injectable } from "inversify";
import { Types } from "mongoose";
import { BadRequestError, NotFoundError } from "../../common/errors";
import { groupThemes } from "../../common/helpers/group-themes";
import { guard } from "../../common/helpers/guard";
import {
  categoryNameFrom,
  parseTemplateContent,
  requestBody,
} from "../../common/helpers/parse-template-content";
import { deleteCloudinaryImage, uploadTemplateImage } from "../../config/cloudinary";
import TYPES from "../../constants/types";
import { toTemplateJson } from "../../mappers/template.mapper";
import {
  ITemplate,
  ITemplateContent,
  compactTemplateContent,
  contentFamilyFromCategory,
  findTemplateImage,
  upsertTemplateImage,
} from "../../models/template.model";
import type ITemplateRepository from "../../repositories/interfaces/template-repository.interface";
import type IThemeRepository from "../../repositories/interfaces/theme-repository.interface";
import ITemplateService from "../interfaces/template-service.interface";

@injectable()
export default class TemplateService implements ITemplateService {
  constructor(
    @inject(TYPES.ITemplateRepository) private readonly templateRepository: ITemplateRepository,
    @inject(TYPES.IThemeRepository) private readonly themeRepository: IThemeRepository
  ) {}

  async list() {
    return guard("Could not load templates", async () => {
      return this.withThemes(await this.templateRepository.findAll());
    });
  }

  async show(slug: string) {
    return guard("Could not load template", async () => {
      const normalized = slug.trim();

      if (!normalized) {
        throw new BadRequestError("Template slug is required");
      }

      const template = await this.templateRepository.findBySlug(normalized);

      if (!template) {
        throw new NotFoundError("Template not found");
      }

      const [json] = await this.withThemes([template]);
      return json;
    });
  }

  async update(slug: string, body: unknown, file?: Request["file"]) {
    return guard("Could not update template", async () => {
      const normalized = slug.trim();

      if (!normalized) {
        throw new BadRequestError("Template slug is required");
      }

      const existing = await this.templateRepository.findBySlug(normalized);

      if (!existing) {
        throw new NotFoundError("Template not found");
      }

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
            await deleteCloudinaryImage(item.publicId);
          }
        }
      }

      const payload: {
        content: ITemplateContent;
        images?: { slot: string; url: string; publicId: string }[];
      } = { content };

      if (file) {
        const uploaded = await uploadTemplateImage(file);
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

      const template = await this.templateRepository.updateBySlug(normalized, payload);
      const [json] = template ? await this.withThemes([template]) : [];
      return json;
    });
  }

  async selectTheme(slug: string, body: unknown) {
    return guard("Could not change theme", async () => {
      const normalized = slug.trim();
      const selectedThemeId = String(requestBody(body).selectedThemeId || "").trim();

      if (!normalized) {
        throw new BadRequestError("Template slug is required");
      }

      if (!selectedThemeId || !Types.ObjectId.isValid(selectedThemeId)) {
        throw new BadRequestError("A valid selectedThemeId is required");
      }

      const template = await this.templateRepository.findBySlug(normalized);

      if (!template) {
        throw new NotFoundError("Template not found");
      }

      const theme = await this.themeRepository.findById(selectedThemeId);

      if (!theme || String(theme.templateId) !== String(template._id)) {
        throw new BadRequestError("Theme does not belong to this template");
      }

      const updated = await this.templateRepository.updateSelectedTheme(
        String(template._id),
        selectedThemeId
      );
      const [json] = updated ? await this.withThemes([updated]) : [];
      return json;
    });
  }

  private async withThemes(templates: ITemplate[]) {
    const ensured: ITemplate[] = [];

    for (const template of templates) {
      ensured.push(await this.themeRepository.ensureForTemplate(template));
    }

    const grouped = groupThemes(await this.themeRepository.findAll());

    return ensured.map((template) =>
      toTemplateJson(template, grouped.get(String(template._id)) || [])
    );
  }
}
