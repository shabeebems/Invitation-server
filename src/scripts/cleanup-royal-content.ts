/**
 * Unset obsolete Royal Reception content fields from template + works.
 * Clears unused loveStoryItems.icon values.
 *
 * Run: npm run cleanup:royal-content
 */
import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { TemplateModel } from "../models/template.model";
import { WorkModel } from "../models/work.model";

const ROYAL_SLUG = "royal-reception";

const UNSET_FIELDS = [
  "content.dayNote",
  "content.loveStoryDateLine",
  "content.coverTagline",
  "content.coverTitle",
  "content.skipLabel",
  "content.viewPhotoLabel",
  "content.addressFull",
  "content.openGoogleLabel",
  "content.openAppleLabel",
  "content.copyAddressLabel",
] as const;

type StoryItem = {
  icon?: string;
  date?: string;
  place?: string;
  title?: string;
  url?: string;
  publicId?: string;
};

function cleanStoryItems(items: StoryItem[] | undefined) {
  if (!Array.isArray(items) || items.length === 0) {
    return { next: items, cleared: 0 };
  }
  let cleared = 0;
  const next = items.map((item) => {
    if (item.icon) cleared += 1;
    return {
      icon: "",
      date: item.date || "",
      place: item.place || "",
      title: item.title || "",
      url: item.url || "",
      publicId: item.publicId || "",
    };
  });
  return { next, cleared };
}

async function main() {
  await connectDB();

  const template = await TemplateModel.findOne({ slug: ROYAL_SLUG });
  if (!template) {
    console.log(`Template not found: ${ROYAL_SLUG}`);
    await mongoose.disconnect();
    return;
  }

  const unsetDoc = Object.fromEntries(UNSET_FIELDS.map((key) => [key, ""]));

  const templateResult = await TemplateModel.updateOne(
    { _id: template._id },
    { $unset: unsetDoc }
  );

  const workResult = await WorkModel.updateMany(
    { templateId: template._id },
    { $unset: unsetDoc }
  );

  // Also drop globally removed keys from celestial templates/works (seed leftovers).
  const globalUnset = {
    "content.dayNote": "",
    "content.coverTagline": "",
    "content.coverTitle": "",
    "content.loveStoryDateLine": "",
  };
  const globalTemplate = await TemplateModel.updateMany({}, { $unset: globalUnset });
  const globalWorks = await WorkModel.updateMany({}, { $unset: globalUnset });

  let iconsCleared = 0;
  const { next: templateStories, cleared: templateCleared } = cleanStoryItems(
    template.content?.loveStoryItems as StoryItem[] | undefined
  );
  if (templateStories && templateCleared >= 0 && Array.isArray(templateStories)) {
    iconsCleared += templateCleared;
    await TemplateModel.updateOne(
      { _id: template._id },
      { $set: { "content.loveStoryItems": templateStories } }
    );
  }

  const works = await WorkModel.find({ templateId: template._id }).select("content.loveStoryItems");
  for (const work of works) {
    const { next, cleared } = cleanStoryItems(work.content?.loveStoryItems as StoryItem[] | undefined);
    if (!next || cleared === 0) continue;
    iconsCleared += cleared;
    await WorkModel.updateOne({ _id: work._id }, { $set: { "content.loveStoryItems": next } });
  }

  console.log(`Royal template unset: matched=${templateResult.matchedCount} modified=${templateResult.modifiedCount}`);
  console.log(`Royal works unset: matched=${workResult.matchedCount} modified=${workResult.modifiedCount}`);
  console.log(`Global obsolete unset: templates=${globalTemplate.modifiedCount} works=${globalWorks.modifiedCount}`);
  console.log(`Love-story icons cleared: ${iconsCleared}`);

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
