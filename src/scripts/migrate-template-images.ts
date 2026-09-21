import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { ITemplateImage, TemplateModel } from "../models/template.model";

const LEGACY_UNSET = {
  coupleImageUrl: 1,
  coupleImagePublicId: 1,
  galleryImage1Url: 1,
  galleryImage1PublicId: 1,
  galleryImage2Url: 1,
  galleryImage2PublicId: 1,
  galleryImage3Url: 1,
  galleryImage3PublicId: 1,
};

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function imagesFromDoc(doc: Record<string, unknown>): ITemplateImage[] {
  const bySlot = new Map<string, ITemplateImage>();

  if (Array.isArray(doc.images)) {
    for (const item of doc.images) {
      if (!item || typeof item !== "object") {
        continue;
      }

      const image = item as Record<string, unknown>;
      const slot = asString(image.slot).trim();

      if (!slot) {
        continue;
      }

      bySlot.set(slot, {
        slot,
        url: asString(image.url),
        publicId: asString(image.publicId),
      });
    }
  }

  const legacy: [string, unknown, unknown][] = [
    ["hero", doc.coupleImageUrl, doc.coupleImagePublicId],
    ["gallery1", doc.galleryImage1Url, doc.galleryImage1PublicId],
    ["gallery2", doc.galleryImage2Url, doc.galleryImage2PublicId],
    ["gallery3", doc.galleryImage3Url, doc.galleryImage3PublicId],
  ];

  for (const [slot, url, publicId] of legacy) {
    if (bySlot.has(slot)) {
      continue;
    }

    const nextUrl = asString(url);
    const nextPublicId = asString(publicId);

    if (!nextUrl && !nextPublicId) {
      continue;
    }

    bySlot.set(slot, { slot, url: nextUrl, publicId: nextPublicId });
  }

  return [...bySlot.values()];
}

async function migrateTemplateImages(): Promise<void> {
  await connectDB();

  const docs = await TemplateModel.collection.find({}).toArray();
  let updated = 0;

  for (const doc of docs) {
    const images = imagesFromDoc(doc as Record<string, unknown>);

    await TemplateModel.collection.updateOne(
      { _id: doc._id },
      {
        $set: { images },
        $unset: LEGACY_UNSET,
      }
    );

    updated += 1;
    console.log(`${doc.slug || doc._id}: ${images.length} image(s)`);
  }

  console.log(`Migrated ${updated} template(s)`);
  await mongoose.disconnect();
}

migrateTemplateImages().catch((error) => {
  console.error("Failed to migrate template images:", error);
  process.exit(1);
});
