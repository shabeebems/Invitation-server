import { connectDB } from "../config/db";
import CategoryRepository from "../repositories/implementations/category-repository";
import TemplateRepository from "../repositories/implementations/template-repository";
import ThemeRepository from "../repositories/implementations/theme-repository";
import mongoose from "mongoose";

const categoryRepository = new CategoryRepository();
const templateRepository = new TemplateRepository();
const themeRepository = new ThemeRepository();

async function importCrimsonScroll(): Promise<void> {
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

  const scrollImage = "/templates/crimson-scroll/scroll-bg.webp";

  const template = await templateRepository.upsertBySlug({
    slug: "crimson-scroll",
    name: "The Crimson Scroll",
    description: "An heirloom Kerala Nikkah and Wedding invitation featuring an animated gold filigree frame entrance, Surah Ar-Rum calligraphy, real-time crimson rose petal physics, multi-ceremony itinerary (Nikah, Reception, Wedding Feast), and a continuous heirloom royal parchment scroll.",
    categoryId: wedding._id,
    isActive: true,
    images: [{ slot: "hero", url: scrollImage, publicId: "crimson-scroll-bg" }],
    content: {
      bismillah: "بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
      bismillahTranslation: "In the Name of Allah\nThe Most Gracious & The Most Merciful",
      hostNames: "Feroz Khan\n& Fathimath Saneera",
      introLine: "With hearts full of joy and gratitude, we cordially invite your esteemed presence along with your family on the auspicious occasion of the Nikah ceremony of our beloved ones. Your prayers, blessings, and gracious presence will make this sacred and joyous occasion truly memorable.",
      blessing: "وَمِنْ اٰيٰتِهٖٓ اَنْ خَلَقَ لَكُمْ مِّنْ اَنْفُسِكُمْ اَزْوَاجًا لِّتَسْكُنُوْٓا اِلَيْهَا وَجَعَلَ بَيْنَكُمْ مَّوَدَّةً وَّرَحْمَةً",
      shareText: "Surah Ar-Rum · 30:21",
      hamdalah: "“And He placed between you affection and mercy.”",
      brideName: "Fathimath Riza P",
      brideParents: "D/O Mr. Feroz Khan & Mrs. Fathimath Saneera",
      familyLine: "Grand Daughter of\nLate Muhammad Rafi Haji & Mrs Aysha\nMoideen Kunhi Haji & Mrs Subaida",
      groomName: "Nizamudheen KP",
      hostLabel: "S/O Mr. Muhammed Kunhi & Mrs. Ramla",
      weekday: "Sunday",
      day: "2",
      monthYear: "August 2026",
      headlinePrefix: "18 Safar 1448 AH",
      ceremonyTitle: "Nikah",
      time: "4:00 PM",
      venueHall: "Hena Hut",
      venueCity: "Kavu Haji Road, Kottappuram, Nileshwar",
      receptionTitle: "7:00 PM",
      houseName: "Bride’s Residence",
      dayNote: "11:00 AM – 3:00 PM",
      venueName: "Mina Villa",
      addressFull: "Near CK Nair College, Padannakkad",
      mapsUrl: "https://maps.app.goo.gl/ikPrfDBgTPo21RwN7",
      presenceLine: "Pathu & Ayshu",
      countdownHeading: "Counting Down to the Wedding",
      coverTitle: "Fathimath Riza P & Nizamudheen KP",
      coverTagline: "2.8.2026",
      footer: "Crafted with elegance on Inviteo",
      eventDateIso: "2026-08-02T11:00:00+05:30",
    },
  });

  console.log(`Upserted Crimson Scroll template: ${template._id} (${template.slug})`);

  const defaultTheme = await themeRepository.findOrCreate({
    title: "Imperial Crimson",
    templateId: template._id,
  });

  await themeRepository.findOrCreate({
    title: "Midnight Wine",
    templateId: template._id,
  });

  await themeRepository.findOrCreate({
    title: "Royal Emerald",
    templateId: template._id,
  });

  await templateRepository.updateSelectedTheme(String(template._id), String(defaultTheme._id));

  console.log(`✓ Template created successfully: ${template.name} (${template.slug})`);
  console.log(`✓ Linked default theme: ${defaultTheme.title}`);
  await mongoose.disconnect();
}

importCrimsonScroll().catch((err) => {
  console.error("Failed to import Crimson Scroll template:", err);
  process.exit(1);
});
