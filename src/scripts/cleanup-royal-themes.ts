/**
 * Royal Reception themes: keep only Red Velvet + Emerald Grove.
 * Renames/removes legacy titles (Hulk, Royal Maroon, Emerald Hulk, etc.).
 *
 * Run: npm run cleanup:royal-themes
 */
import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { TemplateModel } from "../models/template.model";
import { ThemeModel } from "../models/theme.model";
import { WorkModel } from "../models/work.model";

const ROYAL_SLUG = "royal-reception";
const KEEP_TITLES = ["Red Velvet", "Emerald Grove"] as const;
const REMOVE_TITLES = ["Royal Maroon", "Emerald Hulk", "Emerald", "Maroon", "Hulk"] as const;

async function main() {
  await connectDB();

  const template = await TemplateModel.findOne({ slug: ROYAL_SLUG });
  if (!template) {
    console.log(`Template not found: ${ROYAL_SLUG}`);
    await mongoose.disconnect();
    return;
  }

  // Rename Hulk → Emerald Grove in place when present.
  const renamed = await ThemeModel.updateMany(
    { templateId: template._id, title: "Hulk" },
    { $set: { title: "Emerald Grove" } }
  );

  const removed = await ThemeModel.deleteMany({
    templateId: template._id,
    title: { $in: [...REMOVE_TITLES] },
  });

  const extras = await ThemeModel.deleteMany({
    templateId: template._id,
    title: { $nin: [...KEEP_TITLES] },
  });

  let redVelvet = await ThemeModel.findOne({ templateId: template._id, title: "Red Velvet" });
  if (!redVelvet) {
    redVelvet = await ThemeModel.create({ title: "Red Velvet", templateId: template._id });
  }

  let emerald = await ThemeModel.findOne({ templateId: template._id, title: "Emerald Grove" });
  if (!emerald) {
    emerald = await ThemeModel.create({ title: "Emerald Grove", templateId: template._id });
  }

  await TemplateModel.findByIdAndUpdate(template._id, { selectedThemeId: redVelvet._id });

  const works = await WorkModel.find({ templateId: template._id });
  let remapped = 0;
  const keepIds = new Set([String(redVelvet._id), String(emerald._id)]);

  for (const work of works) {
    const currentId = work.selectedThemeId ? String(work.selectedThemeId) : "";
    if (!currentId || !keepIds.has(currentId)) {
      await WorkModel.findByIdAndUpdate(work._id, { selectedThemeId: redVelvet._id });
      remapped += 1;
    }
  }

  console.log(`Renamed Hulk → Emerald Grove: ${renamed.modifiedCount}`);
  console.log(`Removed legacy titles: ${removed.deletedCount}`);
  console.log(`Removed extra titles: ${extras.deletedCount}`);
  console.log(`Kept themes: Red Velvet=${redVelvet._id}, Emerald Grove=${emerald._id}`);
  console.log(`Template default -> Red Velvet`);
  console.log(`Works remapped to Red Velvet: ${remapped}`);

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
