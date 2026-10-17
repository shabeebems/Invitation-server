/**
 * Ensure every template + work has content.enabledSections for its family.
 * Missing/invalid lists are replaced with the full catalog defaults.
 *
 * Run: npm run seed:enabled-sections
 */
import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { TemplateModel } from "../models/template.model";
import { WorkModel } from "../models/work.model";
import {
  defaultEnabledSections,
  familyFromTemplateSlug,
  resolveEnabledSections,
  type TemplateSectionFamily,
} from "../common/helpers/template-sections";

function sectionsEqual(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  return a.every((id, index) => id === b[index]);
}

/** Insert newly cataloged optional sections into an existing saved list. */
function withNewHouseSections(saved: string[] | undefined | null): string[] | undefined | null {
  if (!Array.isArray(saved)) return saved;
  if (saved.includes("countdown")) return saved;
  const next = [...saved];
  const heroIdx = next.indexOf("hero");
  if (heroIdx >= 0) {
    next.splice(heroIdx + 1, 0, "countdown");
  } else {
    next.unshift("countdown");
  }
  return next;
}

async function main() {
  await connectDB();

  const templates = await TemplateModel.find({}).select("_id slug content.enabledSections");
  let templatesUpdated = 0;

  const templateFamily = new Map<string, TemplateSectionFamily>();

  for (const template of templates) {
    const family = familyFromTemplateSlug(template.slug);
    templateFamily.set(String(template._id), family);

    const saved =
      family === "house"
        ? withNewHouseSections(template.content?.enabledSections)
        : template.content?.enabledSections;
    const next = resolveEnabledSections(family, saved);
    const prev = Array.isArray(template.content?.enabledSections)
      ? template.content.enabledSections
      : null;

    if (!prev || !sectionsEqual(prev, next)) {
      await TemplateModel.updateOne(
        { _id: template._id },
        { $set: { "content.enabledSections": next } }
      );
      templatesUpdated += 1;
      console.log(
        `Template ${template.slug}: enabledSections -> [${next.join(", ")}]`
      );
    }
  }

  const works = await WorkModel.find({}).select("_id slug templateId content.enabledSections");
  let worksUpdated = 0;

  for (const work of works) {
    const templateId = work.templateId ? String(work.templateId) : "";
    const family =
      templateFamily.get(templateId) ||
      familyFromTemplateSlug(work.slug || "");

    const saved =
      family === "house"
        ? withNewHouseSections(work.content?.enabledSections)
        : work.content?.enabledSections;
    const next = resolveEnabledSections(family, saved);
    const prev = Array.isArray(work.content?.enabledSections)
      ? work.content.enabledSections
      : null;

    if (!prev || !sectionsEqual(prev, next)) {
      await WorkModel.updateOne(
        { _id: work._id },
        { $set: { "content.enabledSections": next } }
      );
      worksUpdated += 1;
      console.log(
        `Work ${work.slug}: enabledSections -> [${next.join(", ")}] (${family})`
      );
    }
  }

  console.log(
    `Done. Templates updated=${templatesUpdated}/${templates.length}; works updated=${worksUpdated}/${works.length}`
  );
  console.log(
    `Defaults: royal=[${defaultEnabledSections("royal").join(", ")}]; house=[${defaultEnabledSections("house").join(", ")}]`
  );

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error("Failed to seed enabledSections:", error);
  await mongoose.disconnect();
  process.exit(1);
});
