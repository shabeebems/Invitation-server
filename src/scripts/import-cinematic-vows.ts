import { connectDB } from "../config/db";
import CategoryRepository from "../repositories/implementations/category-repository";
import TemplateRepository from "../repositories/implementations/template-repository";
import ThemeRepository from "../repositories/implementations/theme-repository";
import mongoose from "mongoose";

const categoryRepository = new CategoryRepository();
const templateRepository = new TemplateRepository();
const themeRepository = new ThemeRepository();

async function importCinematicVows(): Promise<void> {
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

  const heroImage = "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=85";
  const videoPoster = "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1920&q=85";
  const videoUrl = "/videos/wedding-bg.webm";

  const template = await templateRepository.upsertBySlug({
    slug: "cinematic-vows",
    name: "Cinematic Vows",
    description: "Immersive cinematic video invitation featuring an interactive reveal gate, full-bleed ambient looping film canvas, live countdown, screenplay itinerary, and digital RSVP.",
    categoryId: wedding._id,
    isActive: true,
    images: [{ slot: "hero", url: heroImage, publicId: "cinematic-vows-hero" }],
    content: {
      bismillah: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
      hostLabel: "Together With Their Beloved Families",
      hostNames: "Mr. Tariq Mansoor & Mrs. Farhana Tariq",
      introLine: "cordially invite you to witness and celebrate the premiere of a lifelong love story",
      groomName: "Zayd",
      brideName: "Layla",
      brideParentsLabel: "Daughter of",
      brideParents: "Dr. Rashid Al-Hassan & Mrs. Yasmin Rashid",
      presenceLine: "Your prayers, presence, and blessings will illuminate our celebration.",
      weekday: "Saturday",
      day: "19",
      monthYear: "December 2026",
      time: "04:30 PM",
      dayNote: "A golden-hour union solemnized in love and companionship",
      eventDateIso: "2026-12-19T16:30:00.000Z",
      eventEndIso: "2026-12-19T22:00:00.000Z",
      countdownHeading: "Counting Down to The Premiere",
      countdownLiveLabel: "The Premiere Celebration is Live",
      coverTagline: "The Premiere of a Lifetime",
      coverTitle: "Zayd & Layla",
      envelopeTagline: "A Love Story in Motion",
      videoUrl: videoUrl,
      videoPosterUrl: videoPoster,
      storyTitle: "Chapter One: When Stars Aligned",
      storyText: "Under the golden glow of a quiet winter evening, two paths crossed and recognized what had already been written in the heavens. From whispered conversations about dreams, faith, and family to standing here today—ready to begin forever hand in hand.",
      programEyebrow: "The Screenplay Itinerary",
      programTitle: "Scenes of the Celebration",
      programIntro: "Every chapter of our special evening, curated with love and warm hospitality.",
      programItems: [
        { time: "04:30 PM", title: "Scene I: The Golden Hour Welcome", description: "Red carpet arrival, refreshing sunset mocktails, and family greetings in the foyer." },
        { time: "05:45 PM", title: "Scene II: The Sacred Nikah Ceremony", description: "The solemn vows, heartfelt prayers, and official union in the Grand Glass Pavilion." },
        { time: "07:30 PM", title: "Scene III: The Gala Premiere Dinner", description: "A sumptuous celebratory culinary feast accompanied by live acoustic melodies." },
        { time: "09:30 PM", title: "Scene IV: Starlit Farewell & Sparklers", description: "Celebratory cake cutting, warm duas, and bidding farewell under sparklers." },
      ],
      galleryEyebrow: "Captured Frames",
      galleryTitle: "Glimpses of Forever",
      galleryIntro: "Stills from our journey leading up to this unforgettable milestone.",
      galleryItems: [
        { eyebrow: "Scene 01", title: "Golden Radiance", caption: "Walking in silence and harmony", url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80", publicId: "" },
        { eyebrow: "Scene 02", title: "Heartbeat in Sync", caption: "Every laughter a promised tomorrow", url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1000&q=80", publicId: "" },
        { eyebrow: "Scene 03", title: "Twilight Embrace", caption: "Surrounded by boundless warmth", url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1000&q=80", publicId: "" },
        { eyebrow: "Scene 04", title: "Forever Begins", caption: "Two souls, one sacred path", url: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1000&q=80", publicId: "" },
      ],
      locationEyebrow: "The Premiere Destination",
      venueLabel: "The Glass Pavilion & Estate",
      venueName: "The Grand Waterfront Pavilion",
      venueHall: "Sunset Horizon Ballroom",
      venueCity: "Kochi, Kerala",
      addressFull: "Marine Drive Promenade, Waterfront District, Kochi, Kerala 682031",
      mapsUrl: "https://www.google.com/maps/search/?api=1&query=Marine%20Drive%20Kochi",
      googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Marine%20Drive%20Kochi",
      appleMapsUrl: "https://maps.apple.com/?q=Marine%20Drive%20Kochi",
      dressCode: "Black Tie, Regal Velvet, or Traditional Festive Grandeur",
      rsvpNote: "Kindly confirm your presence by December 1, 2026 to facilitate our hospitality arrangements",
      blessing: "“And He placed between you love and compassion.” — Surah Ar-Rum",
      closingBlessing: "May our journey be filled with eternal peace, barakah, and joyous laughter.",
      footer: "© Cinematic Vows · Premiered with elegance on Inviteo",
      shareText: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\n\nYou are joyfully invited to the wedding celebration of Zayd & Layla\nSaturday, 19 December 2026 · 04:30 PM\nThe Grand Waterfront Pavilion, Kochi\n\nPlease join us with your prayers and presence ✨",
      hashtag: "#ZaydAndLayla2026",
      inviteLine: "Kindly grace our premiere celebration with your esteemed presence and blessings",
    },
  });

  // Seed 3 Curated Themes
  const defaultTheme = await themeRepository.findOrCreate({
    title: "Obsidian Gold",
    templateId: template._id,
  });

  await themeRepository.findOrCreate({
    title: "Sapphire Velvet",
    templateId: template._id,
  });

  await themeRepository.findOrCreate({
    title: "Emerald Twilight",
    templateId: template._id,
  });

  await templateRepository.updateSelectedTheme(String(template._id), String(defaultTheme._id));

  console.log(`✓ Template created successfully: ${template.name} (${template.slug})`);
  console.log(`✓ Linked default theme: ${defaultTheme.title}`);
  await mongoose.disconnect();
}

importCinematicVows().catch((err) => {
  console.error("Failed to import Cinematic Vows template:", err);
  process.exit(1);
});
