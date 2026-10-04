import { connectDB } from "../config/db";
import CategoryRepository from "../repositories/implementations/category-repository";
import TemplateRepository from "../repositories/implementations/template-repository";
import ThemeRepository from "../repositories/implementations/theme-repository";
import mongoose from "mongoose";

const categoryRepository = new CategoryRepository();
const templateRepository = new TemplateRepository();
const themeRepository = new ThemeRepository();

async function importBurgundyBloom(): Promise<void> {
  await connectDB();

  let wedding = await categoryRepository.findWedding();

  if (!wedding) {
    wedding = await categoryRepository.create({
      name: "Wedding",
      description: "Wedding invitation templates",
      isActive: true,
    });
    console.log(`Created Wedding category: ${wedding._id}`);
  } else {
    console.log(`Using Wedding category: ${wedding.name} (${wedding._id})`);
  }

  const coverImage = "/templates/burgundy-bloom/cover-bg.jpg";
  const bgPattern = "/templates/burgundy-bloom/bloom-bg.jpg";
  const audioUrl = "/templates/burgundy-bloom/audio.mp3";

  const template = await templateRepository.upsertBySlug({
    slug: "burgundy-bloom",
    name: "Burgundy Bloom",
    description: "An heirloom Kerala Nikkah and Reception wedding invitation featuring a typewriter cover entrance, Quranic calligraphy from Surah Ar-Rum, floating rose petal physics, and warm antique gold filigree.",
    categoryId: wedding._id,
    isActive: true,
    images: [{ slot: "hero", url: coverImage, publicId: "burgundy-bloom-cover" }],
    content: {
      bismillah: "بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
      bismillahTranslation: "In the Name of Allah\nThe Most Gracious & The Most Merciful",
      headlinePrefix: "You Are Cordially Invited",
      introLine: "With hearts full of joy and gratitude, we cordially invite your esteemed presence along with your family on the auspicious occasion of the Nikkah ceremony of our beloved ones. Your prayers, blessings, and gracious presence will make this sacred and joyous occasion truly memorable.",
      blessing: "وَمِنْ اٰيٰتِهٖٓ اَنْ خَلَقَ لَكُمْ مِّنْ اَنْفُسِكُمْ اَزْوَاجًا لِّتَسْكُنُوْٓا اِلَيْهَا وَجَعَلَ بَيْنَكُمْ مَّوَدَّةً وَّرَحْمَةً",
      shareText: "Surah Ar-Rum · 30:21",
      hamdalah: "“And He placed between you affection and mercy.”",
      brideName: "Aysha Neha",
      brideParents: "D/O Riyas & Rahida Riyas",
      groomName: "Basim Ali",
      hostNames: "S/O Mujeeb Rahman & Shamna Mujeeb",
      weekday: "Saturday",
      day: "5",
      monthYear: "September 2026",
      time: "10:45 AM",
      ceremonyTitle: "Nikkah",
      receptionTitle: "12:00 PM – 3:00 PM",
      venueName: "Majestic Hall",
      addressFull: "Near Ashwini Clinic, Chintha Valapp",
      mapsUrl: "https://maps.app.goo.gl/SnXKiwnKtErqcHAa7",
      countdownHeading: "Counting Down to the Nikkah",
      dayNote: "Saturday · 5 September 2026 · 10:45 AM",
      coverTitle: "Aysha Neha & Basim Ali",
      coverTagline: "5.9.2026",
      footer: "Crafted with elegance on Inviteo",
      eventDateIso: "2026-09-05T10:45:00+05:30",
    },
  });

  console.log(`Upserted Burgundy Bloom template: ${template._id} (${template.slug})`);

  const defaultTheme = await themeRepository.findOrCreate({
    title: "Classic Burgundy",
    templateId: template._id,
  });

  await themeRepository.findOrCreate({
    title: "Rose Noir",
    templateId: template._id,
  });

  await themeRepository.findOrCreate({
    title: "Emerald Velvet",
    templateId: template._id,
  });

  await templateRepository.updateSelectedTheme(String(template._id), String(defaultTheme._id));

  console.log(`✓ Template created successfully: ${template.name} (${template.slug})`);
  console.log(`✓ Linked default theme: ${defaultTheme.title}`);
  await mongoose.disconnect();
}

importBurgundyBloom().catch((err) => {
  console.error("Failed to import Burgundy Bloom template:", err);
  process.exit(1);
});
