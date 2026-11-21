/**
 * Aligns isPublished / publishedAt with paymentStatus.
 *
 * Run:      npm run fix:work-publish-flags
 * Dry run:  npm run fix:work-publish-flags -- --dry-run
 */
import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { WorkModel } from "../models/work.model";

const dryRun = process.argv.includes("--dry-run");

async function main() {
  await connectDB();

  const demoteFilter = { paymentStatus: { $ne: "paid" }, isPublished: true };
  const promoteFilter = { paymentStatus: "paid", isPublished: { $ne: true } };
  const stampFilter = { paymentStatus: "paid", publishedAt: null };

  const [demoteCount, promoteCount, stampCount] = await Promise.all([
    WorkModel.countDocuments(demoteFilter),
    WorkModel.countDocuments(promoteFilter),
    WorkModel.countDocuments(stampFilter),
  ]);

  if (dryRun) {
    console.log("[dry-run] No writes.");
    console.log(`Would demote drafts (unpaid but isPublished=true): ${demoteCount}`);
    console.log(`Would flag paid works live (paid but isPublished≠true): ${promoteCount}`);
    console.log(`Would stamp publishedAt on paid works missing it: ${stampCount}`);
    await mongoose.disconnect();
    return;
  }

  const demote = await WorkModel.updateMany(demoteFilter, {
    $set: { isPublished: false, publishedAt: null },
  });

  const promote = await WorkModel.updateMany(promoteFilter, {
    $set: { isPublished: true },
  });

  const stamp = await WorkModel.updateMany(stampFilter, {
    $set: { publishedAt: new Date() },
  });

  console.log(
    `Drafts demoted: ${demote.modifiedCount} · Paid flagged live: ${promote.modifiedCount} · publishedAt stamped: ${stamp.modifiedCount}`
  );

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
