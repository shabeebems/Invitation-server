import { connectDB } from "../config/db";
import CategoryRepository from "../repositories/implementations/category-repository";
import TemplateRepository from "../repositories/implementations/template-repository";
import ThemeRepository from "../repositories/implementations/theme-repository";
import mongoose from "mongoose";

const categoryRepository = new CategoryRepository();
const templateRepository = new TemplateRepository();
const themeRepository = new ThemeRepository();

async function importEternalUnion(): Promise<void> {
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

  const heroImage = "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=85";

  const template = await templateRepository.upsertBySlug({
    slug: "eternal-union",
    name: "Eternal Union",
    description: "Opulent royal wedding invitation with love story timeline, multi-event itinerary, photo gallery, interactive RSVP, and calendar sync.",
    categoryId: wedding._id,
    isActive: true,
    images: [{ slot: "hero", url: heroImage, publicId: "eternal-union-hero" }],
    content: {
      bismillah: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
      hostLabel: "In the Name of God, Most Gracious, Most Merciful",
      hostNames: "Mr. Abdul Rahman & Mrs. Amina",
      introLine: "request the honour of your presence at the wedding ceremony & celebration of their beloved son",
      groomName: "Ibrahim",
      brideName: "Aisha",
      brideParentsLabel: "Daughter of",
      brideParents: "Mr. Nizar Ahmed & Mrs. Suhara Nizar",
      presenceLine: "Your presence, prayers and warm wishes will honor our celebration.",
      weekday: "Sunday",
      day: "27",
      monthYear: "December 2026",
      time: "11:00 AM",
      dayNote: "A sacred covenant under the blessings of our elders",
      eventDateIso: "2026-12-27T11:00:00.000Z",
      eventEndIso: "2026-12-27T16:00:00.000Z",
      countdownHeading: "Counting Down to the Sacred Union",
      countdownLiveLabel: "The Celebration is Live",
      envelopeTagline: "Together With Their Families",
      storyTitle: "Our Journey to Forever",
      storyText: "From our very first conversation under a starlit evening in Calicut to discovering a shared dream of building a life filled with purpose, laughter, and faith. Two families united by grace, two souls choosing each other for eternity. We are overjoyed to welcome you into this next chapter of our story.",
      programEyebrow: "Celebration Schedule",
      programTitle: "The Wedding Itinerary",
      programIntro: "Every moment thoughtfully curated to celebrate love, family, and lifelong companionship.",
      programItems: [
        { time: "09:30 AM", title: "Welcome & Traditional Kahwa", description: "Arrival of guests, refreshing welcome drinks, and family greetings in the foyer." },
        { time: "11:00 AM", title: "The Sacred Vows (Nikah)", description: "The solemnization ceremony and prayers in the Grand Ballroom." },
        { time: "12:30 PM", title: "Royal Banquet Feast", description: "Traditional Malabar culinary feast with loved ones and friends." },
        { time: "03:00 PM", title: "Farewell & Duo Blessings", description: "Cherished photo moments, dua, and sending off the newlyweds." },
      ],
      galleryEyebrow: "Pre-Wedding Moments",
      galleryTitle: "Glimpses of Love",
      galleryIntro: "Captured moments of joy, laughter, and anticipation leading up to our big day.",
      galleryItems: [
        { eyebrow: "Elegance", title: "A New Beginning", caption: "Walking into forever hand in hand", url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80", publicId: "" },
        { eyebrow: "The Vow", title: "In Silence & Harmony", caption: "Every glance a promise", url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1000&q=80", publicId: "" },
        { eyebrow: "Grace", title: "Golden Radiance", caption: "Treasured laughter with family", url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1000&q=80", publicId: "" },
        { eyebrow: "Together", title: "Eternal Grace", caption: "Surrounded by boundless blessings", url: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1000&q=80", publicId: "" },
      ],
      locationEyebrow: "Location & Directions",
      venueLabel: "The Grand Venue",
      venueName: "The Grand Palace Ballroom",
      venueHall: "Royal Emerald Hall",
      venueCity: "Kozhikode",
      addressFull: "Bypass Junction, Near Cyberpark, Palazhi, Kozhikode, Kerala 673014",
      mapsUrl: "https://www.google.com/maps/search/?api=1&query=Grand%20Palace%20Auditorium%20Kozhikode",
      googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Grand%20Palace%20Auditorium%20Kozhikode",
      appleMapsUrl: "https://maps.apple.com/?q=Grand%20Palace%20Auditorium%20Kozhikode",
      dressCode: "Royal Velvet, Traditional Gold & Ivory, or Formal Festive",
      rsvpNote: "Kindly respond by December 15, 2026 to assist our hospitality arrangements",
      blessing: "“And among His signs is that He created for you mates from among yourselves, that you may dwell in tranquility with them.” — Surah Ar-Rum",
      closingBlessing: "May Allah bless this union and grant it infinite love and peace.",
      footer: "© Eternal Union · Crafted with elegance on Inviteo",
      shareText: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\n\nYou're joyfully invited to the wedding celebration of Ibrahim & Aisha\nSunday, 27 December 2026 · 11:00 AM\nThe Grand Palace Ballroom, Kozhikode\n\nPlease join us with your prayers and blessings 🤲",
      hashtag: "#IbrahimAndAisha2026",
      inviteLine: "Kindly grace the occasion with your presence and duas",
    },
  });

  // Seed Themes: Imperial Velvet (default), Emerald Garden, Nocturne Royale
  const defaultTheme = await themeRepository.findOrCreate({
    title: "Imperial Velvet",
    templateId: template._id,
  });

  await themeRepository.findOrCreate({
    title: "Emerald Garden",
    templateId: template._id,
  });

  await themeRepository.findOrCreate({
    title: "Nocturne Royale",
    templateId: template._id,
  });

  await templateRepository.updateSelectedTheme(String(template._id), String(defaultTheme._id));

  console.log(`✓ Template created successfully: ${template.name} (${template.slug})`);
  console.log(`✓ Linked default theme: ${defaultTheme.title}`);
  await mongoose.disconnect();
}

importEternalUnion().catch((err) => {
  console.error("Failed to import Eternal Union template:", err);
  process.exit(1);
});
