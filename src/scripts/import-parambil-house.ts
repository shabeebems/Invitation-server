import path from "path";
import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { TEMPLATE_IMAGE_FOLDER, uploadImageFile } from "../config/cloudinary";
import { CategoryRepository } from "../repositories/category.repository";
import { TemplateRepository } from "../repositories/template.repository";
import { ThemeRepository } from "../repositories/theme.repository";

const categoryRepository = new CategoryRepository();
const templateRepository = new TemplateRepository();
const themeRepository = new ThemeRepository();

const IMAGE_DIR = path.resolve(
  __dirname,
  "../../../client/public/templates/parambil-house"
);

async function uploadNamed(fileName: string) {
  const uploaded = await uploadImageFile(path.join(IMAGE_DIR, fileName), TEMPLATE_IMAGE_FOLDER);
  console.log(`Uploaded ${fileName}: ${uploaded.url}`);
  return uploaded;
}

async function importParambilHouse(): Promise<void> {
  await connectDB();

  const category = await categoryRepository.findHouseWarming();

  if (!category) {
    throw new Error('House Warming category not found. Create it first.');
  }

  console.log(`Using category: ${category.name} (${category._id})`);

  const [hero, gallery1, gallery2, gallery3] = await Promise.all([
    uploadNamed("house_cutout_hero.png"),
    uploadNamed("house_front.jpg"),
    uploadNamed("house_side.jpg"),
    uploadNamed("house_cutout_1.png"),
  ]);

  const template = await templateRepository.upsertBySlug({
    slug: "parambil-house",
    name: "Parambil House",
    description: "Linen housewarming invitation with terracotta wax-seal envelope, program, home tour, and maps.",
    categoryId: category._id,
    isActive: true,
    images: [{ slot: "hero", url: hero.url, publicId: hero.publicId }],
    content: {
      bismillah: "بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
      hostNames: "Latheef & Ameena",
      weekday: "Saturday",
      day: "12",
      monthYear: "September 2026",
      time: "09:30 AM onwards",
      venueName: "Parambil House",
      venueCity: "Muthanikuzhi, Ongallur • Palakkad",
      blessing:
        "May Allah bless this home with peace, barakah, boundless joy, and grant safety to all who enter.",
      shareText:
        "بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ\n\nYou're invited to the housewarming of Latheef & Ameena\nwith Alhan & Liyana\nSaturday, 12 September 2026 · 09:30 AM onwards\nParambil House, Muthanikuzhi, Ongallur, Palakkad\n\nView invitation: ",
      envelopeTagline: "A New Abode • Endless Barakah",
      skipLabel: "Skip animation & enter",
      openHint: "Tap the wax seal to unveil your invitation",
      bismillahTranslation: "In the name of Allah, the Most Gracious, the Most Merciful",
      mashallahBadge: "Masha’Allah TabarakAllah",
      headlinePrefix: "Warm Welcome to the New Home of",
      familyLine: "with Alhan & Liyana",
      houseName: "Parambil House",
      eventDateIso: "2026-09-12T09:30:00+05:30",
      eventEndIso: "2026-09-12T18:00:00+05:30",
      countdownHeading: "Counting Down to the Housewarming & Blessing",
      countdownLiveLabel: "The auspicious day is here! Welcome!",
      programEyebrow: "The Day's Itinerary",
      programTitle: "Program & Blessing Ceremony",
      programIntro:
        "Join us as we step across this new threshold with heartfelt Dua, warm fellowship, and a traditional celebratory feast.",
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
      galleryEyebrow: "Home Tour",
      galleryTitle: "A Glimpse of Parambil House",
      galleryIntro:
        "Crafted with love, natural sunlight, and serene earthy textures — a peaceful sanctuary to make cherished memories with family and friends.",
      galleryItems: [
        {
          eyebrow: "Front View",
          title: "Parambil House — Front Elevation",
          caption: "Contemporary architectural design of Parambil House at Muthanikuzhi, Ongallur.",
          url: gallery1.url,
          publicId: gallery1.publicId,
        },
        {
          eyebrow: "Side Perspective",
          title: "Exterior Perspective & Balcony",
          caption: "Sunlit modern facade with glass balcony rails and warm ambient exterior lighting.",
          url: gallery2.url,
          publicId: gallery2.publicId,
        },
        {
          eyebrow: "Design Showcase",
          title: "Architectural Model & Elevation",
          caption: "Detailed view of the architectural lines and modern elevation of our new home.",
          url: gallery3.url,
          publicId: gallery3.publicId,
        },
      ],
      viewPhotoLabel: "View Full Photo",
      locationEyebrow: "Getting Here",
      locationTitle: "Venue & Directions",
      locationIntro:
        "We eagerly look forward to your arrival. Tap below to navigate directly using Google Maps or Apple Maps.",
      destinationLabel: "Destination",
      addressFull: "Parambil House, Muthanikuzhi, Ongallur, Palakkad, Kerala",
      addressShort: "Muthanikuzhi, Ongallur",
      googleMapsUrl:
        "https://www.google.com/maps/place/10%C2%B047'42.8%22N+76%C2%B012'53.7%22E/@10.7952328,76.2123299,17z",
      appleMapsUrl: "https://maps.apple.com/?q=10.7952328,76.2149048",
      copyAddressLabel: "Copy Full Address",
      openGoogleLabel: "Open in Google Maps",
      openAppleLabel: "Open in Apple Maps",
      hamdalah: "الْحَمْدُ لِلَّٰهِ",
      closingBlessing:
        "Alhamdulillah for all His blessings. May Allah bless our home with peace, happiness, safety, and generous hospitality forever.",
      closingPresence: "Warmly awaiting your gracious presence,",
      replayLabel: "Replay Invitation Envelope",
      craftedBy: "Crafted with love by Thabsheera Thasni",
      navCelebration: "Celebration",
      navProgram: "Program & Dua",
      navTour: "Home Tour",
      navLocation: "Location",
      addToCalendarLabel: "Add to Calendar",
      getDirectionsLabel: "Get Directions",
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
