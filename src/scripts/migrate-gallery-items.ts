import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { IGalleryItem, ITemplateImage, TemplateModel } from "../models/template.model";

const LEGACY_GALLERY_UNSET = {
  "content.gallery1Eyebrow": 1,
  "content.gallery1Title": 1,
  "content.gallery1Caption": 1,
  "content.gallery2Eyebrow": 1,
  "content.gallery2Title": 1,
  "content.gallery2Caption": 1,
  "content.gallery3Eyebrow": 1,
  "content.gallery3Title": 1,
  "content.gallery3Caption": 1,
};

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function asImages(value: unknown): ITemplateImage[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => {
    const row = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
    return {
      slot: asString(row.slot),
      url: asString(row.url),
      publicId: asString(row.publicId),
    };
  });
}

function galleryItemsFromDoc(content: Record<string, unknown>, images: ITemplateImage[]): IGalleryItem[] {
  if (Array.isArray(content.galleryItems) && content.galleryItems.length > 0) {
    return content.galleryItems.map((item, index) => {
      const row = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
      const fallback = images.find((image) => image.slot === `gallery${index + 1}`);
      return {
        eyebrow: asString(row.eyebrow),
        title: asString(row.title),
        caption: asString(row.caption),
        url: asString(row.url) || asString(fallback?.url),
        publicId: asString(row.publicId) || asString(fallback?.publicId),
      };
    });
  }

  const items: IGalleryItem[] = [];

  for (let index = 1; index <= 3; index += 1) {
    const eyebrow = asString(content[`gallery${index}Eyebrow`]);
    const title = asString(content[`gallery${index}Title`]);
    const caption = asString(content[`gallery${index}Caption`]);
    const image = images.find((entry) => entry.slot === `gallery${index}`);
    const url = asString(image?.url);
    const publicId = asString(image?.publicId);

    if (!eyebrow && !title && !caption && !url) {
      continue;
    }

    items.push({ eyebrow, title, caption, url, publicId });
  }

  return items;
}

async function migrateGalleryItems(): Promise<void> {
  await connectDB();

  const docs = await TemplateModel.collection.find({}).toArray();
  let updated = 0;

  for (const doc of docs) {
    const content = (doc.content && typeof doc.content === "object" ? doc.content : {}) as Record<string, unknown>;
    const images = asImages(doc.images);
    const galleryItems = galleryItemsFromDoc(content, images);
    const nextImages = images.filter((image) => !/^gallery\d+$/i.test(image.slot));

    await TemplateModel.collection.updateOne(
      { _id: doc._id },
      {
        $set: {
          "content.galleryItems": galleryItems,
          images: nextImages,
        },
        $unset: LEGACY_GALLERY_UNSET,
      }
    );

    updated += 1;
    console.log(
      `${doc.slug || doc._id}: ${galleryItems.length} gallery item(s), ${nextImages.length} image slot(s)`
    );
  }

  console.log(`Migrated ${updated} template(s)`);
  await mongoose.disconnect();
}

migrateGalleryItems().catch((error) => {
  console.error("Failed to migrate gallery items:", error);
  process.exit(1);
});
