import fs from "fs";
import path from "path";
import { SITE_ASSET_FOLDER, uploadAssetFile } from "../config/cloudinary";
import { SEED_ASSETS_DIR, runImport } from "./_shared/seed-template";

runImport("Site assets", async () => {
  const landingVideoName = fs
    .readdirSync(SEED_ASSETS_DIR)
    .find((name) => name.startsWith("Palace_courtyard") && name.endsWith(".mp4"));

  if (!landingVideoName) {
    throw new Error("No Palace_courtyard*.mp4 found under server/seed-assets");
  }

  const landingVideoPath = path.join(SEED_ASSETS_DIR, landingVideoName);
  const uploaded = await uploadAssetFile(landingVideoPath, SITE_ASSET_FOLDER);
  console.log(`Uploaded landing hero video: ${uploaded.url}`);

  const outPath = path.resolve(__dirname, "../../../client/src/lib/site-assets.ts");
  const contents = `export const LANDING_HERO_VIDEO = "${uploaded.url}";\n`;
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, contents, "utf8");
  console.log(`Wrote ${outPath}`);
});
