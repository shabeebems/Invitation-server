/**
 * Purge legacy map fields across MongoDB templates and works:
 * - content.appleMapsUrl
 * - content.openAppleLabel
 * - content.openGoogleLabel
 * - appleMapsUrl on locationItems array elements
 *
 * Run: npx tsx src/scripts/cleanup-maps-legacy.ts
 */
import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { TemplateModel } from "../models/template.model";
import { WorkModel } from "../models/work.model";

async function main() {
  await connectDB();

  const unsetFields = {
    "content.appleMapsUrl": "",
    "content.openAppleLabel": "",
    "content.openGoogleLabel": "",
  };

  const templatesUnsetResult = await TemplateModel.updateMany({}, { $unset: unsetFields });
  const worksUnsetResult = await WorkModel.updateMany({}, { $unset: unsetFields });

  // Unset appleMapsUrl inside locationItems array
  const templatesLocationResult = await TemplateModel.updateMany(
    { "content.locationItems": { $exists: true } },
    { $unset: { "content.locationItems.$[].appleMapsUrl": "" } }
  );

  const worksLocationResult = await WorkModel.updateMany(
    { "content.locationItems": { $exists: true } },
    { $unset: { "content.locationItems.$[].appleMapsUrl": "" } }
  );

  console.log(`Templates top-level unset: matched=${templatesUnsetResult.matchedCount} modified=${templatesUnsetResult.modifiedCount}`);
  console.log(`Works top-level unset: matched=${worksUnsetResult.matchedCount} modified=${worksUnsetResult.modifiedCount}`);
  console.log(`Templates locationItems unset: matched=${templatesLocationResult.matchedCount} modified=${templatesLocationResult.modifiedCount}`);
  console.log(`Works locationItems unset: matched=${worksLocationResult.matchedCount} modified=${worksLocationResult.modifiedCount}`);

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error("Migration failed:", error);
  await mongoose.disconnect();
  process.exit(1);
});
