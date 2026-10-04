import { connectDB } from "../config/db";
import CategoryRepository from "../repositories/implementations/category-repository";
import TemplateRepository from "../repositories/implementations/template-repository";
import ThemeRepository from "../repositories/implementations/theme-repository";
import mongoose from "mongoose";

const categoryRepository = new CategoryRepository();
const templateRepository = new TemplateRepository();
const themeRepository = new ThemeRepository();

async function importBotanicalOrangery(): Promise<void> {
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
    slug: "botanical-orangery",
    name: "The Botanical Orangery",
    description: "An enchanted Tuscan villa and living floral meadow wedding invitation featuring falling flower petal physics, neoclassical stone arches, and sun-drenched olive grove aesthetics.",
    categoryId: wedding._id,
    isActive: true,
    images: [{ slot: "hero", url: heroImage, publicId: "botanical-orangery-hero" }],
    content: {
      bismillah: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
      hostLabel: "Together With Their Beloved Families",
      hostNames: "Mr. Tariq Mansoor & Mrs. Farhana Tariq",
      introLine: "joyfully invite you to celebrate the holy matrimony and blossoming union of",
      groomName: "Zayd",
      brideName: "Layla",
      brideParentsLabel: "Cherished Daughter of",
      brideParents: "Dr. Rashid Al-Hassan & Mrs. Yasmin Rashid",
      presenceLine: "Your prayers, presence, and blessings will grace our celebration like spring rain upon blooming flowers.",
      weekday: "Saturday",
      day: "19",
      monthYear: "December 2026",
      time: "04:30 PM",
      dayNote: "A golden-hour union solemnized in romantic gardens under the canopy of ancient olive trees",
      eventDateIso: "2026-12-19T16:30:00.000Z",
      eventEndIso: "2026-12-19T23:00:00.000Z",
      countdownHeading: "Awaiting The Garden Twilight",
      countdownLiveLabel: "The Garden Celebration Has Commenced",
      coverTagline: "The Tuscan Villa Edition",
      coverTitle: "Zayd & Layla",
      storyTitle: "Rooted in Faith, Blossoming in Love",
      storyText: "Like an ancient garden nurtured by patience and devotion, our love story grew gently through shared values, quiet laughter, and the comforting knowledge that our paths were cultivated by divine design.",
      programEyebrow: "The Garden Itinerary",
      programTitle: "The Celebration of Moments",
      programIntro: "Curated milestones of our celebration evening amid blossoming florals and warm Mediterranean hospitality.",
      programItems: [
        { time: "04:30 PM", title: "Sunset Gathering & Citrus Kahwa", description: "Arrival under golden hour light, chilled botanical infusions, and family greetings in the courtyard." },
        { time: "05:45 PM", title: "The Sacred Vows (Nikah)", description: "The solemnization ceremony and heartfelt prayers beneath the jasmine-draped stone gazebo." },
        { time: "07:30 PM", title: "The Orangery Feast & Banqueting", description: "A sumptuous celebratory culinary feast served family-style under hanging fairy lights." },
        { time: "09:45 PM", title: "Starlit Farewell & Sparklers", description: "Celebratory cake cutting, warm duas, and bidding farewell under sparklers in the meadow." },
      ],
      galleryEyebrow: "Meadow Stills",
      galleryTitle: "Moments in the Orangery",
      galleryIntro: "Glimpses of our journey captured under dappled sunlight and quiet garden paths.",
      galleryItems: [
        { eyebrow: "Flora 01", title: "Golden Radiance", caption: "Walking in harmony along the cypress path", url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80", publicId: "" },
        { eyebrow: "Flora 02", title: "Whispers of Jasmine", caption: "Laughter echoed across the terracotta terrace", url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1000&q=80", publicId: "" },
        { eyebrow: "Flora 03", title: "Twilight Monologue", caption: "Soft breezes beneath the olive grove", url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1000&q=80", publicId: "" },
        { eyebrow: "Flora 04", title: "Eternal Commitment", caption: "Two souls flourishing under one sky", url: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1000&q=80", publicId: "" },
      ],
      locationEyebrow: "The Villa Estate",
      venueLabel: "The Orangery & Garden Conservatory",
      venueName: "Villa Rosa Orangery",
      venueHall: "The Cypress Garden Pavilion",
      venueCity: "Muscat, Sultanate of Oman",
      addressFull: "Coastal Palm Road, Coastal District, Muscat 114, Sultanate of Oman",
      mapsUrl: "https://www.google.com/maps/search/?api=1&query=Villa%20Rosa%20Muscat",
      googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Villa%20Rosa%20Muscat",
      appleMapsUrl: "https://maps.apple.com/?q=Villa%20Rosa%20Muscat",
      dressCode: "Garden Haute Couture, Flowing Silks, Linen Elegance, or Warm Terracotta Palette",
      rsvpNote: "Kindly confirm your presence by December 1, 2026 to ensure our garden hospitality arrangements.",
      blessing: "“And He placed between you love and compassion.” — Surah Ar-Rum",
      closingBlessing: "May grace, peace, and eternal blossoming fragrance accompany our shared journey.",
      footer: "© The Botanical Orangery · Cultivated with romance on Inviteo",
      shareText: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\n\nYou are joyfully invited to the garden wedding celebration of Zayd & Layla\nSaturday, 19 December 2026 · 04:30 PM\nVilla Rosa Orangery, Muscat\n\nMay your presence grace our blooming celebration ✨",
      hashtag: "#ZaydAndLaylaInTheOrangery",
      inviteLine: "Kindly honor our garden celebration with your esteemed presence and heartfelt prayers",
    },
  });

  console.log(`Upserted Botanical Orangery template: ${template._id} (${template.slug})`);

  // Seed 3 Curated Themes
  const defaultTheme = await themeRepository.findOrCreate({
    title: "Tuscan Sunlight",
    templateId: template._id,
  });

  await themeRepository.findOrCreate({
    title: "Riviera Jasmine",
    templateId: template._id,
  });

  await themeRepository.findOrCreate({
    title: "Amalfi Lemon Grove",
    templateId: template._id,
  });

  await templateRepository.updateSelectedTheme(String(template._id), String(defaultTheme._id));

  console.log(`✓ Template created successfully: ${template.name} (${template.slug})`);
  console.log(`✓ Linked default theme: ${defaultTheme.title}`);
  await mongoose.disconnect();
}

importBotanicalOrangery().catch((err) => {
  console.error("Failed to import Botanical Orangery template:", err);
  process.exit(1);
});
