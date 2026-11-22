import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { TemplateModel } from "../models/template.model";
import { findContentLimitViolations } from "../common/helpers/content-limits";

async function main() {
  await connectDB();
  const templates = await TemplateModel.find({}).lean();
  const report = templates.map((t) => {
    const text = JSON.stringify(t.content || {});
    return {
      slug: t.slug,
      violations: findContentLimitViolations(t.content || {}),
      softTap: /Tap a card|tap any photo|Tap below|\(demo\)|Villa Placeholder|Add the family/i.test(text),
      offer: t.offerPrice,
      actual: t.actualPrice,
      footer: String((t.content as { footer?: string } | undefined)?.footer || "").slice(0, 80),
    };
  });
  console.log(JSON.stringify(report, null, 2));
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
