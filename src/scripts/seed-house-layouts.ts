/**
 * Backfill house template layout + ambiance defaults (parambil-house and derived works).
 * Also strips removed house gallery fields.
 *
 * Run: npm run seed:house-layouts
 */
import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { TemplateModel } from "../models/template.model";
import { WorkModel } from "../models/work.model";
import {
  familyFromTemplateSlug,
  type TemplateSectionFamily,
} from "../common/helpers/template-sections";

const HOUSE_LAYOUT_DEFAULTS: Record<string, string> = {
  ambianceEffect: "starry-glow",
  heroLayout: "classic",
  countdownLayout: "outline",
  programLayout: "zigzag",
  locationLayout: "portrait",
};

const AMBIANCE_REMAP: Record<string, string> = {
  leaves: "floral-bloom",
  petals: "floral-bloom",
  dust: "starry-glow",
  sparkles: "starry-glow",
};

const COUNTDOWN_LAYOUT_REMAP: Record<string, string> = {
  classic: "outline",
  banner: "capsule",
  compact: "tabs",
  rings: "outline",
  minimal: "dividers",
};

const SCHEDULE_LAYOUT_REMAP: Record<string, string> = {
  timeline: "zigzag",
  list: "editorial",
  cards: "rail",
  steps: "modern",
  compact: "botanical",
};

const LOCATION_LAYOUT_REMAP: Record<string, string> = {
  split: "pane",
  stacked: "portrait",
  compact: "pill",
  cards: "atlas",
  folio: "atlas",
};

const HOUSE_GALLERY_UNSET = {
  "content.galleryItems": "",
  "content.galleryLayout": "",
  "content.galleryEyebrow": "",
  "content.galleryTitle": "",
  "content.galleryIntro": "",
  "content.viewPhotoLabel": "",
  "content.locationEyebrow": "",
  "content.appleMapsUrl": "",
  "content.openAppleLabel": "",
  "content.openGoogleLabel": "",
  "content.shareText": "",
} as const;

function layoutPatch(content: Record<string, unknown> | undefined): Record<string, string> {
  const patch: Record<string, string> = {};
  for (const [key, value] of Object.entries(HOUSE_LAYOUT_DEFAULTS)) {
    const current = content?.[key];
    if (typeof current !== "string" || current.trim() === "") {
      patch[key] = value;
    }
  }

  const countdown = content?.countdownLayout;
  if (typeof countdown === "string" && COUNTDOWN_LAYOUT_REMAP[countdown]) {
    patch.countdownLayout = COUNTDOWN_LAYOUT_REMAP[countdown];
  }

  const schedule = content?.programLayout;
  if (typeof schedule === "string" && SCHEDULE_LAYOUT_REMAP[schedule]) {
    patch.programLayout = SCHEDULE_LAYOUT_REMAP[schedule];
  }

  const location = content?.locationLayout;
  if (typeof location === "string" && LOCATION_LAYOUT_REMAP[location]) {
    patch.locationLayout = LOCATION_LAYOUT_REMAP[location];
  }

  const ambiance = content?.ambianceEffect;
  if (typeof ambiance === "string" && AMBIANCE_REMAP[ambiance]) {
    patch.ambianceEffect = AMBIANCE_REMAP[ambiance];
  }

  return patch;
}

async function main() {
  await connectDB();

  const templates = await TemplateModel.find({}).select("_id slug content");
  const templateFamily = new Map<string, TemplateSectionFamily>();
  let templatesUpdated = 0;

  for (const template of templates) {
    const family = familyFromTemplateSlug(template.slug);
    templateFamily.set(String(template._id), family);
    if (family !== "house") {
      continue;
    }

    const patch = layoutPatch(template.content as unknown as Record<string, unknown>);
    const setFields = Object.fromEntries(
      Object.entries(patch).map(([key, value]) => [`content.${key}`, value])
    );

    await TemplateModel.updateOne(
      { _id: template._id },
      {
        ...(Object.keys(setFields).length ? { $set: setFields } : {}),
        $unset: HOUSE_GALLERY_UNSET,
      }
    );
    templatesUpdated += 1;
    console.log(
      `Template ${template.slug}: gallery unset${
        Object.keys(patch).length ? `; set ${JSON.stringify(patch)}` : ""
      }`
    );
  }

  const works = await WorkModel.find({}).select("_id slug templateId content");
  let worksUpdated = 0;

  for (const work of works) {
    const templateId = work.templateId ? String(work.templateId) : "";
    const family =
      templateFamily.get(templateId) || familyFromTemplateSlug(work.slug || "");

    if (family !== "house") {
      continue;
    }

    const patch = layoutPatch(work.content as unknown as Record<string, unknown>);
    const setFields = Object.fromEntries(
      Object.entries(patch).map(([key, value]) => [`content.${key}`, value])
    );

    await WorkModel.updateOne(
      { _id: work._id },
      {
        ...(Object.keys(setFields).length ? { $set: setFields } : {}),
        $unset: HOUSE_GALLERY_UNSET,
      }
    );
    worksUpdated += 1;
    console.log(
      `Work ${work.slug}: gallery unset${
        Object.keys(patch).length ? `; set ${JSON.stringify(patch)}` : ""
      }`
    );
  }

  console.log(
    `Done. House templates updated=${templatesUpdated}; house works updated=${worksUpdated}`
  );

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error("Failed to seed house layouts:", error);
  await mongoose.disconnect();
  process.exit(1);
});
