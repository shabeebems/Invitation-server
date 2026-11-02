/**
 * Sets the actual and offer price on every template.
 *
 * Run: npm run seed:template-prices
 */
import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { DEFAULT_ACTUAL_PRICE, DEFAULT_OFFER_PRICE, TemplateModel } from "../models/template.model";

async function main() {
  await connectDB();

  const result = await TemplateModel.updateMany(
    {},
    { $set: { actualPrice: DEFAULT_ACTUAL_PRICE, offerPrice: DEFAULT_OFFER_PRICE } }
  );
  console.log(
    `Set ₹${DEFAULT_ACTUAL_PRICE} / ₹${DEFAULT_OFFER_PRICE} on ${result.modifiedCount} of ${result.matchedCount} template(s)`
  );

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
