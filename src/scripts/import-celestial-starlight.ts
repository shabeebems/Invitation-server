import { connectDB } from "../config/db";
import CategoryRepository from "../repositories/implementations/category-repository";
import TemplateRepository from "../repositories/implementations/template-repository";
import ThemeRepository from "../repositories/implementations/theme-repository";
import mongoose from "mongoose";

const categoryRepository = new CategoryRepository();
const templateRepository = new TemplateRepository();
const themeRepository = new ThemeRepository();

async function importCelestialStarlight(): Promise<void> {
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

  const heroImage = "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=85";

  const template = await templateRepository.upsertBySlug({
    slug: "celestial-starlight",
    name: "Celestial Starlight",
    description: "An ethereal midnight celebration among the stars with interactive constellation maps, planetary orbits, glowing moon phase, and champagne starlight aesthetics.",
    categoryId: wedding._id,
    isActive: true,
    images: [{ slot: "hero", url: heroImage, publicId: "celestial-starlight-hero" }],
    content: {
      bismillah: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
      hostLabel: "By Divine Decree & The Grace of God",
      hostNames: "Mr. Tariq Mansoor & Mrs. Farhana Tariq",
      introLine: "joyfully invite you to witness the starlit union and holy matrimony of their beloved children",
      groomName: "Zayd",
      brideName: "Layla",
      brideParentsLabel: "Cherished Daughter of",
      brideParents: "Dr. Rashid Al-Hassan & Mrs. Yasmin Rashid",
      presenceLine: "Your prayers, presence, and blessings will illuminate our celebration like constellations in the night sky.",
      weekday: "Saturday",
      day: "19",
      monthYear: "December 2026",
      time: "05:00 PM",
      dayNote: "A twilight union solemnized under the gentle rising of the crescent moon and evening stars",
      eventDateIso: "2026-12-19T17:00:00.000Z",
      eventEndIso: "2026-12-19T23:00:00.000Z",
      countdownHeading: "Celestial Alignment Countdown",
      countdownLiveLabel: "The Starlit Celebration is Live",
      coverTagline: "Written In The Heavens",
      coverTitle: "Zayd & Layla",
      envelopeTagline: "A Celestial Union",
      storyTitle: "Written in the Heavens",
      storyText: "Long before our footsteps crossed on earth, our souls were destined in the celestial scrolls. From quiet prayers whispered under midnight skies to the moment our paths met, every constellation aligned to bring two souls into eternal harmony.",
      programEyebrow: "Planetary Trajectory",
      programTitle: "The Celestial Itinerary",
      programIntro: "Follow the celestial journey as the twilight horizon transforms into a canopy of celebration.",
      programItems: [
        { time: "05:00 PM", title: "Twilight Gathering & Sunset Kahwa", description: "Arrival under the dusk sky, golden-hour drinks, and joyous family greetings." },
        { time: "06:15 PM", title: "The Sacred Vows (Nikah Solemnization)", description: "The solemn exchange of eternal vows and heartfelt prayers under the glass dome." },
        { time: "07:45 PM", title: "The Starlit Gala Banquet", description: "An exquisite gastronomic feast served beneath thousands of shimmering celestial lights." },
        { time: "09:45 PM", title: "Lantern Illumination & Farewell", description: "Releasing glowing starlight lanterns, midnight dua, and sending off the newlyweds." },
      ],
      galleryEyebrow: "Constellation Memories",
      galleryTitle: "Moments Among the Stars",
      galleryIntro: "Cherished glimpses capturing the laughter, devotion, and harmony of our shared journey.",
      galleryItems: [
        { eyebrow: "Orion", title: "Golden Radiance", caption: "Walking hand in hand toward eternity", url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80", publicId: "" },
        { eyebrow: "Lyra", title: "Twilight Serenade", caption: "Whispers of grace beneath the evening sky", url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1000&q=80", publicId: "" },
        { eyebrow: "Cygnus", title: "Infinite Harmony", caption: "Two souls anchored in faith and affection", url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1000&q=80", publicId: "" },
        { eyebrow: "Cassiopeia", title: "Written Forever", caption: "Blessed by the heavens, cherished on earth", url: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1000&q=80", publicId: "" },
      ],
      locationEyebrow: "Earthly Observatory",
      venueLabel: "The Royal Glass Observatory",
      venueName: "Al Bustan Palace Dome",
      venueHall: "The Celestial Atrium & Gardens",
      venueCity: "Muscat, Sultanate of Oman",
      addressFull: "Al Bustan Street, Qantab, Muscat 114, Sultanate of Oman",
      mapsUrl: "https://www.google.com/maps/search/?api=1&query=Al%20Bustan%20Palace%20Muscat",
      googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Al%20Bustan%20Palace%20Muscat",
      appleMapsUrl: "https://maps.apple.com/?q=Al%20Bustan%20Palace%20Muscat",
      dressCode: "Celestial Black Tie, Midnight Velvet, or Starlight Champagne Grandeur",
      rsvpNote: "Kindly light your star in our sky by confirming before December 1, 2026",
      blessing: "“And He has subjected for you the night and day and the sun and moon, and the stars are subjected by His command.” — Surah An-Nahl",
      closingBlessing: "May Allah bless this union and illuminate our shared lifetime with peace, barakah, and starlight.",
      footer: "© Celestial Starlight · Written in the Heavens on Inviteo",
      shareText: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\n\nYou are joyfully invited to the celestial wedding celebration of Zayd & Layla\nSaturday, 19 December 2026 · 05:00 PM\nAl Bustan Palace Dome, Muscat\n\nMay your presence illuminate our starlit evening ✨",
      hashtag: "#ZaydAndLaylaInTheStars",
      inviteLine: "Kindly honor our starlit celebration with your esteemed presence and heartfelt prayers",
    },
  });

  console.log(`Upserted Celestial Starlight template: ${template._id} (${template.slug})`);

  // Seed 3 Curated Themes
  const defaultTheme = await themeRepository.findOrCreate({
    title: "Midnight Astral",
    templateId: template._id,
  });

  await themeRepository.findOrCreate({
    title: "Eclipse Noir",
    templateId: template._id,
  });

  await themeRepository.findOrCreate({
    title: "Aurora Borealis",
    templateId: template._id,
  });

  await templateRepository.updateSelectedTheme(String(template._id), String(defaultTheme._id));

  console.log(`✓ Template created successfully: ${template.name} (${template.slug})`);
  console.log(`✓ Linked default theme: ${defaultTheme.title}`);
  await mongoose.disconnect();
}

importCelestialStarlight().catch((err) => {
  console.error("Failed to import Celestial Starlight template:", err);
  process.exit(1);
});
