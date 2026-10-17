import path from "path";
import mongoose from "mongoose";
import { connectDB } from "../../config/db";
import CategoryRepository from "../../repositories/implementations/category-repository";
import TemplateRepository from "../../repositories/implementations/template-repository";
import ThemeRepository from "../../repositories/implementations/theme-repository";
import { ICategory } from "../../models/category.model";
import { ITemplate } from "../../models/template.model";

export const categoryRepository = new CategoryRepository();
export const templateRepository = new TemplateRepository();
export const themeRepository = new ThemeRepository();

/** Local seed media for site assets only (not template invitation photos). */
export const SEED_ASSETS_DIR = path.resolve(__dirname, "../../../seed-assets");

type CategoryKind = "Wedding" | "House Warming";

const categoryMeta: Record<
  CategoryKind,
  { description: string; find: () => Promise<ICategory | null> }
> = {
  Wedding: {
    description: "Wedding invitation templates",
    find: () => categoryRepository.findWedding(),
  },
  "House Warming": {
    description: "House warming invitation templates",
    find: () => categoryRepository.findHouseWarming(),
  },
};

export async function ensureCategory(kind: CategoryKind): Promise<ICategory> {
  const meta = categoryMeta[kind];
  let category = await meta.find();

  if (!category) {
    category = await categoryRepository.create({
      name: kind,
      description: meta.description,
      isActive: true,
    });
    console.log(`Created ${kind} category: ${category._id}`);
  } else {
    console.log(`Using ${kind} category: ${category.name} (${category._id})`);
  }

  return category;
}

export async function attachThemes(
  template: ITemplate,
  titles: string[],
  defaultIndex = 0
) {
  const themes = [];

  for (const title of titles) {
    themes.push(
      await themeRepository.findOrCreate({
        title,
        templateId: template._id,
      })
    );
  }

  const selected = themes[defaultIndex] || themes[0];
  if (selected) {
    await templateRepository.updateSelectedTheme(String(template._id), String(selected._id));
  }

  return themes;
}

export async function runImport(label: string, fn: () => Promise<void>) {
  try {
    await connectDB();
    await fn();
    await mongoose.disconnect();
  } catch (error) {
    console.error(`Failed to import ${label}:`, error);
    process.exit(1);
  }
}
