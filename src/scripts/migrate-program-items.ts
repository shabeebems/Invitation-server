import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { IProgramItem, TemplateModel } from "../models/template.model";

const LEGACY_PROGRAM_UNSET = {
  "content.program1Time": 1,
  "content.program1Title": 1,
  "content.program1Description": 1,
  "content.program2Time": 1,
  "content.program2Title": 1,
  "content.program2Description": 1,
  "content.program3Time": 1,
  "content.program3Title": 1,
  "content.program3Description": 1,
  "content.program4Time": 1,
  "content.program4Title": 1,
  "content.program4Description": 1,
  "content.program5Time": 1,
  "content.program5Title": 1,
  "content.program5Description": 1,
};

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function programItemsFromContent(content: Record<string, unknown>): IProgramItem[] {
  if (Array.isArray(content.programItems) && content.programItems.length > 0) {
    return content.programItems.map((item) => {
      const row = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
      return {
        time: asString(row.time),
        title: asString(row.title),
        description: asString(row.description),
      };
    });
  }

  const items: IProgramItem[] = [];

  for (let index = 1; index <= 5; index += 1) {
    const time = asString(content[`program${index}Time`]);
    const title = asString(content[`program${index}Title`]);
    const description = asString(content[`program${index}Description`]);

    if (!time && !title && !description) {
      continue;
    }

    items.push({ time, title, description });
  }

  return items;
}

async function migrateProgramItems(): Promise<void> {
  await connectDB();

  const docs = await TemplateModel.collection.find({}).toArray();
  let updated = 0;

  for (const doc of docs) {
    const content = (doc.content && typeof doc.content === "object" ? doc.content : {}) as Record<string, unknown>;
    const programItems = programItemsFromContent(content);

    await TemplateModel.collection.updateOne(
      { _id: doc._id },
      {
        $set: { "content.programItems": programItems },
        $unset: LEGACY_PROGRAM_UNSET,
      }
    );

    updated += 1;
    console.log(`${doc.slug || doc._id}: ${programItems.length} program item(s)`);
  }

  console.log(`Migrated ${updated} template(s)`);
  await mongoose.disconnect();
}

migrateProgramItems().catch((error) => {
  console.error("Failed to migrate program items:", error);
  process.exit(1);
});
