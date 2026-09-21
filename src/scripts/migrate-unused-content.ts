import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { CategoryModel } from "../models/category.model";
import {
  compactTemplateContent,
  contentFamilyFromCategory,
  IGalleryItem,
  IProgramItem,
  TemplateModel,
} from "../models/template.model";

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function programItemsFrom(value: unknown): IProgramItem[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  return value.map((item) => {
    const row = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
    return {
      time: asString(row.time),
      title: asString(row.title),
      description: asString(row.description),
    };
  });
}

function galleryItemsFrom(value: unknown): IGalleryItem[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  return value.map((item) => {
    const row = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
    return {
      eyebrow: asString(row.eyebrow),
      title: asString(row.title),
      caption: asString(row.caption),
      url: asString(row.url),
      publicId: asString(row.publicId),
    };
  });
}

async function migrateUnusedContent(): Promise<void> {
  await connectDB();

  const categories = await CategoryModel.find().lean();
  const categoryNameById = new Map(categories.map((category) => [String(category._id), category.name || ""]));
  const docs = await TemplateModel.collection.find({}).toArray();
  let updated = 0;

  for (const doc of docs) {
    const family = contentFamilyFromCategory(categoryNameById.get(String(doc.categoryId)) || "");
    const raw = (doc.content && typeof doc.content === "object" ? doc.content : {}) as Record<string, unknown>;
    const compacted = compactTemplateContent(
      {
        ...(raw as object),
        programItems: programItemsFrom(raw.programItems),
        galleryItems: galleryItemsFrom(raw.galleryItems),
      },
      family
    );

    await TemplateModel.collection.replaceOne(
      { _id: doc._id },
      {
        ...doc,
        content: compacted,
      }
    );

    updated += 1;
    console.log(
      `${doc.slug || doc._id} (${family}): ${Object.keys(compacted).length} content key(s)`
    );
  }

  console.log(`Cleaned ${updated} template(s)`);
  await mongoose.disconnect();
}

migrateUnusedContent().catch((error) => {
  console.error("Failed to remove unused template content:", error);
  process.exit(1);
});
