/**
 * Deletes removed templates from MongoDB + managed Cloudinary assets.
 * Kept templates: celestial-starlight, parambil-house, royal-reception
 *
 * Run: npm run cleanup:templates
 */
import { v2 as cloudinary } from "cloudinary";
import { connectDB } from "../config/db";
import { deleteCloudinaryImage, isManagedCloudinaryId } from "../config/cloudinary";
import { TemplateModel } from "../models/template.model";
import { ThemeModel } from "../models/theme.model";
import { CategoryModel } from "../models/category.model";
import { WorkModel } from "../models/work.model";
import mongoose from "mongoose";

const REMOVE_SLUGS = [
  "crimson-scroll",
  "botanical-orangery",
  "cinematic-vows",
  "midnight-birthday",
  "riza-nizamudheen",
  "burgundy-bloom",
];

const KEEP_SLUGS = new Set(["celestial-starlight", "parambil-house", "royal-reception"]);

async function collectPublicIds(
  docs: Array<{
    images?: Array<{ publicId?: string }>;
    content?: { galleryItems?: Array<{ publicId?: string }> };
  }>
) {
  const ids = new Set<string>();

  for (const doc of docs) {
    for (const image of doc.images || []) {
      if (image.publicId) {
        ids.add(image.publicId);
      }
    }
    for (const item of doc.content?.galleryItems || []) {
      if (item.publicId) {
        ids.add(item.publicId);
      }
    }
  }

  return [...ids];
}

async function destroyLooseId(publicId: string) {
  if (isManagedCloudinaryId(publicId)) {
    await deleteCloudinaryImage(publicId);
    return;
  }

  // Best-effort for legacy non-folder publicIds from old seeds
  for (const resourceType of ["image", "video", "raw"] as const) {
    try {
      const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
      if (result.result === "ok") {
        console.log(`Deleted Cloudinary ${resourceType}: ${publicId}`);
        return;
      }
    } catch {
      /* try next type */
    }
  }

  console.log(`Skipped Cloudinary (not found/unmanaged): ${publicId}`);
}

async function main() {
  await connectDB();

  const templates = await TemplateModel.find({ slug: { $in: REMOVE_SLUGS } });
  console.log(`Found ${templates.length} template(s) to remove`);

  const templateIds = templates.map((t) => t._id);
  const publicIds = await collectPublicIds(templates);

  const works = templateIds.length
    ? await WorkModel.find({ templateId: { $in: templateIds } })
    : [];

  if (works.length) {
    console.log(`Found ${works.length} work(s) linked to removed templates`);
    const workIds = await collectPublicIds(works);
    publicIds.push(...workIds);
  }

  for (const publicId of [...new Set(publicIds)]) {
    await destroyLooseId(publicId);
  }

  if (templateIds.length) {
    const themesDeleted = await ThemeModel.deleteMany({ templateId: { $in: templateIds } });
    console.log(`Deleted themes: ${themesDeleted.deletedCount}`);
  }

  if (works.length) {
    const worksDeleted = await WorkModel.deleteMany({ _id: { $in: works.map((w) => w._id) } });
    console.log(`Deleted works: ${worksDeleted.deletedCount}`);
  }

  const templatesDeleted = await TemplateModel.deleteMany({ slug: { $in: REMOVE_SLUGS } });
  console.log(`Deleted templates: ${templatesDeleted.deletedCount}`);

  // Remove Birthday category when no templates remain under it
  const birthday = await CategoryModel.findOne({ name: /birthday/i });
  if (birthday) {
    const stillUsing = await TemplateModel.countDocuments({ categoryId: birthday._id });
    if (stillUsing === 0) {
      if (birthday.imagePublicId && isManagedCloudinaryId(birthday.imagePublicId)) {
        await deleteCloudinaryImage(birthday.imagePublicId);
      }
      await CategoryModel.deleteOne({ _id: birthday._id });
      console.log(`Deleted Birthday category: ${birthday.name}`);
    } else {
      console.log(`Kept Birthday category (${stillUsing} template(s) still linked)`);
    }
  }

  const remaining = await TemplateModel.find({}, { slug: 1, name: 1 }).lean();
  console.log("Remaining templates:");
  for (const row of remaining) {
    const mark = KEEP_SLUGS.has(row.slug) ? "keep" : "unexpected";
    console.log(`  - ${row.slug} (${row.name}) [${mark}]`);
  }

  await mongoose.disconnect();
  console.log("Cleanup complete");
}

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
