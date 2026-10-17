import mongoose from "mongoose";
import { connectDB } from "../config/db";
import CategoryRepository from "../repositories/implementations/category-repository";
import TemplateRepository from "../repositories/implementations/template-repository";
import ThemeRepository from "../repositories/implementations/theme-repository";

const categoryRepository = new CategoryRepository();
const templateRepository = new TemplateRepository();
const themeRepository = new ThemeRepository();

async function importParambilHouse(): Promise<void> {
  await connectDB();

  const category = await categoryRepository.findHouseWarming();

  if (!category) {
    throw new Error('House Warming category not found. Create it first.');
  }

  console.log(`Using category: ${category.name} (${category._id})`);

  // Images live in the DB / Cloudinary and are edited in the template editor.
  // Do not pass `images` here so re-seeds keep whatever is already saved.
  const template = await templateRepository.upsertBySlug({
    slug: "parambil-house",
    name: "Parambil House",
    description: "Linen housewarming invitation with terracotta wax-seal envelope, program, and maps.",
    categoryId: category._id,
    isActive: true,
    content: {
      bismillah: "بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
      hostNames: "Latheef & Ameena",
      weekday: "Saturday",
      day: "12",
      monthYear: "September 2027",
      time: "09:30 AM onwards",
      venueName: "Parambil House",
      venueCity: "Muthanikuzhi, Ongallur • Palakkad",
      blessing:
        "May Allah bless this home with peace, barakah, boundless joy, and grant safety to all who enter.",
      envelopeTagline: "A New Abode • Endless Barakah",
      skipLabel: "Skip animation & enter",
      openHint: "Tap the wax seal to unveil your invitation",
      bismillahTranslation: "In the name of Allah, the Most Gracious, the Most Merciful",
      mashallahBadge: "Masha’Allah TabarakAllah",
      headlinePrefix: "Warm Welcome to the New Home of",
      familyLine: "with Alhan & Liyana",
      houseName: "Parambil House",
      eventDateIso: "2027-09-12T09:30:00+05:30",
      eventEndIso: "2027-09-12T18:00:00+05:30",
      countdownHeading: "The Auspicious Day Is Here! Welcome!",
      countdownLiveLabel: "The auspicious day is here! Welcome!",
      ambianceEffect: "starry-glow",
      heroLayout: "classic",
      countdownLayout: "outline",
      programLayout: "zigzag",
      locationLayout: "portrait",
      enabledSections: ["hero", "countdown", "schedule", "location", "footer"],
      programEyebrow: "Let's Celebrate Together",
      programTitle: "Event Schedule",
      programIntro: "A Day of Blessings, Togetherness & Celebration",
      programItems: [
        {
          time: "09:30 AM",
          title: "Warm Welcome & Gathering",
          description:
            "Welcoming our dear family and friends with warm traditional Kerala hospitality and welcome drinks.",
        },
        {
          time: "10:15 AM",
          title: "House Blessing & Dua Ceremony",
          description:
            "Congregational Dua invoking Allah’s mercy, protection, and abundant barakah for our home and family.",
        },
        {
          time: "11:30 AM",
          title: "Home Tour & Fellowship",
          description: "Walkthrough of our new living spaces, rooms, and terrace with cherished loved ones.",
        },
        {
          time: "12:45 PM",
          title: "Grand Housewarming Feast",
          description: "A lavish traditional celebratory feast prepared with authentic love and flavors.",
        },
        {
          time: "04:30 PM",
          title: "Sunset High Tea & Refreshments",
          description: "Evening tea, Sulaimani, and snacks as the golden sunset settles over the open terrace.",
        },
      ],
      locationTitle: "Venue & Directions",
      locationIntro:
        "We eagerly look forward to your arrival. Tap below to navigate directly using Google Maps.",
      destinationLabel: "Destination",
      addressFull: "Parambil House, Muthanikuzhi, Ongallur, Palakkad, Kerala",
      addressShort: "Muthanikuzhi, Ongallur",
      googleMapsUrl:
        "https://www.google.com/maps/place/10%C2%B047'42.8%22N+76%C2%B012'53.7%22E/@10.7952328,76.2123299,17z",
      copyAddressLabel: "Copy Full Address",
      hamdalah: "الْحَمْدُ لِلَّٰهِ",
      closingBlessing:
        "Alhamdulillah for all His blessings. May Allah bless our home with peace, happiness, safety, and generous hospitality forever.",
      closingPresence: "Warmly awaiting your gracious presence,",
      replayLabel: "Replay Invitation Envelope",
      craftedBy: "Crafted with love by Thabsheera Thasni",
      addToCalendarLabel: "Add to Calendar",
      calendarModalTitle: "Add to Your Calendar",
      calendarModalDesc: "Select your preferred calendar app below to save the date & time:",
      googleCalendarLabel: "Google Calendar",
      icsCalendarLabel: "Apple / Outlook (.ics)",
    },
  });

  const terracotta = await themeRepository.findOrCreate({
    title: "Terracotta Clay",
    templateId: template._id,
  });
  const sage = await themeRepository.findOrCreate({
    title: "Sage Grove",
    templateId: template._id,
  });

  await templateRepository.updateSelectedTheme(String(template._id), String(terracotta._id));

  console.log(`Template ready: ${template.slug} -> ${category.name}`);
  console.log(`TERRACOTTA_THEME_ID=${terracotta._id}`);
  console.log(`SAGE_THEME_ID=${sage._id}`);

  await mongoose.disconnect();
}

importParambilHouse().catch((error) => {
  console.error("Failed to import housewarming template:", error);
  process.exit(1);
});
