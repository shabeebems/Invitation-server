import { connectDB } from "../config/db";
import CategoryRepository from "../repositories/implementations/category-repository";
import TemplateRepository from "../repositories/implementations/template-repository";
import ThemeRepository from "../repositories/implementations/theme-repository";
import mongoose from "mongoose";

const categoryRepository = new CategoryRepository();
const templateRepository = new TemplateRepository();
const themeRepository = new ThemeRepository();

async function importEditorialVogue(): Promise<void> {
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
    slug: "editorial-vogue",
    name: "The Editorial Vogue",
    description: "High-fashion haute couture wedding issue styled like an ultra-luxury magazine with double-page spreads, couple's interview, wardrobe moodboard, and barcode pass.",
    categoryId: wedding._id,
    isActive: true,
    images: [{ slot: "hero", url: heroImage, publicId: "editorial-vogue-hero" }],
    content: {
      bismillah: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
      hostLabel: "THE SPECIAL WEDDING ISSUE · VOL. 26",
      hostNames: "Mr. Tariq Mansoor & Mrs. Farhana Tariq",
      introLine: "request the honour of your presence at the solemnization and matrimonial premiere of",
      groomName: "ZAYD",
      brideName: "LAYLA",
      brideParentsLabel: "Daughter of",
      brideParents: "Dr. Rashid Al-Hassan & Mrs. Yasmin Rashid",
      presenceLine: "Your esteemed presence and prayers are our greatest luxury.",
      weekday: "Saturday",
      day: "19",
      monthYear: "December 2026",
      time: "05:00 PM",
      dayNote: "An intimate evening of couture elegance, timeless vows, and joyous celebration",
      eventDateIso: "2026-12-19T17:00:00.000Z",
      eventEndIso: "2026-12-19T23:30:00.000Z",
      countdownHeading: "ISSUE RELEASE COUNTDOWN",
      countdownLiveLabel: "The Wedding Celebration is Live",
      coverTagline: "THE SPECIAL WEDDING EDITION · VOL. 26",
      coverTitle: "THE UNION OF ZAYD & LAYLA",
      storyTitle: "Exclusive Feature: An Unwritten Destiny",
      storyText: "In an exclusive conversation on modern devotion and divine alignment, Zayd and Layla reflect on their journey: 'From the first moment our families united to the quiet conversations that built our foundation, every chapter was guided with grace.'",
      programEyebrow: "THE RUNNING ORDER",
      programTitle: "Table of Contents & Itinerary",
      programIntro: "Curated moments throughout an evening of refined haute couture hospitality.",
      programItems: [
        { time: "05:00 PM", title: "Couture Welcome & Apertifs", description: "Sunset refreshments, live harpist, and red carpet guest reception in the grand salon." },
        { time: "06:15 PM", title: "The Solemnization Ceremony (Nikah)", description: "The exchange of sacred vows, recitation of holy scriptures, and heartfelt family duas." },
        { time: "07:45 PM", title: "The Haute Gastronomy Banquet", description: "A five-course culinary masterpiece served in the candlelit grand ballroom." },
        { time: "10:00 PM", title: "The Midnight Toast & Farewell", description: "Celebratory cake cutting, starlit sparkler sendoff, and farewell prayers." },
      ],
      galleryEyebrow: "EDITORIAL SPREAD",
      galleryTitle: "Behind the Lens: The Love Story",
      galleryIntro: "Exclusive photographic spreads captured in golden hour light.",
      galleryItems: [
        { eyebrow: "Look 01", title: "The Quiet Prelude", caption: "Raw silk and morning sunlight in the courtyard", url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80", publicId: "" },
        { eyebrow: "Look 02", title: "Couture in Motion", caption: "Handcrafted golden embroidery meets timeless silhouettes", url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1000&q=80", publicId: "" },
        { eyebrow: "Look 03", title: "Twilight Monologue", caption: "Shared smiles beneath the evening horizon", url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1000&q=80", publicId: "" },
        { eyebrow: "Look 04", title: "Eternal Commitment", caption: "Two souls embarking on a shared destiny", url: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1000&q=80", publicId: "" },
      ],
      locationEyebrow: "DESTINATION REPORT",
      venueLabel: "The Palace Conservatory",
      venueName: "Al Bustan Palace Estate",
      venueHall: "The Majan Grand Ballroom",
      venueCity: "Muscat, Oman",
      addressFull: "Al Bustan Street, Qantab Coastal Road, Muscat 114, Sultanate of Oman",
      mapsUrl: "https://www.google.com/maps/search/?api=1&query=Al%20Bustan%20Palace%20Muscat",
      googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Al%20Bustan%20Palace%20Muscat",
      appleMapsUrl: "https://maps.apple.com/?q=Al%20Bustan%20Palace%20Muscat",
      dressCode: "Black Tie Haute Couture, Silk Velvet, or Heritage Regal Grandeur",
      rsvpNote: "Kindly RSVP by December 1, 2026 to ensure exclusive seating arrangements.",
      blessing: "“And He placed between you love and compassion.” — Surah Ar-Rum",
      closingBlessing: "May grace, peace, and eternal elegance accompany our journey together.",
      footer: "THE UNION · ISSUE VOL. 26 · PUBLISHED EXCLUSIVELY ON INVITEO",
      shareText: "THE SPECIAL WEDDING ISSUE · VOL. 26\n\nYou are cordially invited to celebrate the union of Zayd & Layla\nSaturday, 19 December 2026 · 05:00 PM\nAl Bustan Palace Estate, Muscat\n\nAdmit One: Honored Guest · Priceless ✨",
      hashtag: "#TheUnionIssue26",
      inviteLine: "Grace the occasion with your elegance, presence, and prayers",
    },
  });

  console.log(`Upserted Editorial Vogue template: ${template._id} (${template.slug})`);

  // Seed 3 Curated Themes
  const defaultTheme = await themeRepository.findOrCreate({
    title: "High Fashion Noir",
    templateId: template._id,
  });

  await themeRepository.findOrCreate({
    title: "Milano Terracotta",
    templateId: template._id,
  });

  await themeRepository.findOrCreate({
    title: "Parisian Emerald",
    templateId: template._id,
  });

  await templateRepository.updateSelectedTheme(String(template._id), String(defaultTheme._id));

  console.log(`✓ Template created successfully: ${template.name} (${template.slug})`);
  console.log(`✓ Linked default theme: ${defaultTheme.title}`);
  await mongoose.disconnect();
}

importEditorialVogue().catch((err) => {
  console.error("Failed to import Editorial Vogue template:", err);
  process.exit(1);
});
