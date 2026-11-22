import { ThemeModel } from "../models/theme.model";
import { WorkModel } from "../models/work.model";
import {
  attachThemes,
  ensureCategory,
  runImport,
  templateRepository,
} from "./_shared/seed-template";

runImport("Botanical Script", async () => {
  const wedding = await ensureCategory("Wedding");
  const existing = await templateRepository.findBySlug("botanical-script");
  const existingStory = existing?.content?.loveStoryItems || [];
  const existingGallery = existing?.content?.galleryItems || [];

  const programMeta = [
    {
      title: "Mehendi",
      time: "20 Nov 2027, Friday • 4:00 PM",
      description: "The Royal Garden, Udayapuram",
    },
    {
      title: "Sangeet",
      time: "20 Nov 2027, Friday • 7:00 PM",
      description: "The Royal Garden, Udayapuram",
    },
    {
      title: "Wedding Ceremony",
      time: "21 Nov 2027, Saturday • 10:00 AM",
      description: "The Royal Garden, Udayapuram",
    },
  ] as const;

  const programItems = programMeta.map((item) => ({
    title: item.title,
    time: item.time,
    description: item.description,
  }));

  const itineraryMeta = [
    {
      icon: "arrival",
      title: "Arrival",
      date: "20 Nov, 2027 • 2:00 PM",
      place: "welcoming celebrations",
    },
    {
      icon: "celebration",
      title: "Celebration",
      date: "20–21 Nov, 2027 • 7:00 PM",
      place: "Let's celebrate together!",
    },
    {
      icon: "farewell",
      title: "Farewell",
      date: "22 Nov, 2027 • 10:00 AM",
      place: "Until we meet again!",
    },
  ] as const;

  const loveStoryItems = itineraryMeta.map((item, index) => {
    const prev = existingStory[index];
    return {
      icon: item.icon,
      title: item.title,
      date: item.date,
      place: item.place,
      url: prev?.url || "",
      publicId: prev?.publicId || "",
    };
  });

  const galleryMeta = [
    { eyebrow: "Wedding Ceremony", title: "Diya Glow", caption: "Brass lamp and marigolds" },
    { eyebrow: "Mehendi", title: "Henna Hands", caption: "Bridal mehndi details" },
    { eyebrow: "Ceremony", title: "Sacred Mandap", caption: "Floral mandap stage" },
    { eyebrow: "Couple", title: "Garden Walk", caption: "Hand in hand" },
    { eyebrow: "Promise", title: "Wedding Bands", caption: "Rings on velvet" },
    { eyebrow: "Florals", title: "Jasmine Bloom", caption: "White florals" },
    { eyebrow: "Aisle", title: "Evening Aisle", caption: "Lit floral walkway" },
  ] as const;

  const galleryItems = galleryMeta.map((item, index) => {
    const prev = existingGallery[index];
    return {
      eyebrow: item.eyebrow,
      title: item.title,
      caption: item.caption,
      url: prev?.url || "",
      publicId: prev?.publicId || "",
    };
  });

  const template = await templateRepository.upsertBySlug({
    slug: "botanical-script",
    name: "Botanical Script",
    description:
      "Elegant parchment wedding with Great Vibes calligraphy, botanical side sprigs, arch hero, story narrative, event trio, burgundy quote banner, five-column mosaic gallery, weekend itinerary, family party row, and location map.",
    categoryId: wedding._id,
    isActive: true,
    content: {
      hashtag: "AD",
      hostLabel: "21 NOVEMBER 2027 • UDAYAPURAM, KERALA",
      groomName: "Aarav",
      brideName: "Diya",
      groomLabel: "The Groom",
      brideLabel: "The Bride",
      introLine: "Together is our favourite place to be.\nJoin us as we begin our forever.",
      inviteLine: "Wedding",
      weekday: "Saturday",
      day: "21",
      monthYear: "November 2027",
      time: "At 10:00 AM",
      venueLabel: "Dress Code",
      venueName: "The Royal Garden",
      venueCity: "Udayapuram, Rajasthan",
      venueHall: "Garden Pavilion & guest cottages on the estate",
      dressCode: "Traditional / Festive",
      mapsUrl: "https://maps.google.com/?q=The+Royal+Garden+Udayapuram",
      googleMapsUrl: "https://maps.google.com/?q=The+Royal+Garden+Udayapuram",
      locationEyebrow: "The Venue",
      locationTitle: "Location",
      locationIntro: "Find us at The Royal Garden",
      addressFull: "Lake Road, The Royal Garden\nUdayapuram, Rajasthan 313001",
      getDirectionsLabel: "Get Directions",
      locationLayout: "map-only",
      meetCoupleTitle: "A Little About Us",
      storyTitle: "Two Hearts, One Journey",
      storyText:
        "From late-night calls across cities to a lifetime of dreams, Aarav and Diya found in each other a love that feels like home.",
      meetCoupleIntro:
        "Through every laugh, every challenge and every quiet Sunday, we chose each other — and now, we choose forever in Udayapuram.",
      presenceLine: "Our story continues…",
      storyLayout: "arch-narrative",
      meetCoupleLayout: "party-row",
      brideParentsLabel: "Our Family & Wedding Party",
      amenityOneLabel: "Parents of the groom",
      amenityOneDetail: "Mr. & Mrs. Sharma — who made this day possible",
      amenityTwoLabel: "Parents of the bride",
      amenityTwoDetail: "Mr. & Mrs. Iyer — our strongest blessing",
      amenityThreeLabel: "With love",
      amenityThreeDetail: "Siblings, cousins and dearest friends beside us",
      programEyebrow: "Wedding Events",
      programIntro: "Mehendi, sangeet and the wedding — three days of celebration",
      programLayout: "trio-cards",
      programItems,
      blessing:
        "“A new chapter begins, with the blessings of our loved ones.”",
      quoteLayout: "burgundy-banner",
      galleryEyebrow: "Our Gallery",
      galleryTitle: "Our Gallery",
      galleryIntro: "Moments of love, tradition and togetherness",
      galleryLayout: "mosaic-five",
      galleryItems,
      loveStoryTitle: "Weekend Itinerary",
      loveStoryIntro: "Three days of love, joy and togetherness",
      loveStoryLayout: "rail-three",
      loveStoryItems,
      heroLayout: "split-cta",
      ambianceEffect: "leaves",
      eventDateIso: "2027-11-21T10:00:00+05:30",
      enabledSections: [
        "hero",
        "story",
        "events",
        "quote",
        "gallery",
        "itinerary",
        "family",
        "location",
        "footer",
      ],
      closingPresence: "Thank You",
      footer: "for being a part of our journey. We can't wait to celebrate with you!",
      footerLayout: "grove",
      craftedBy: "#AaravWedDiya • #BotanicalScript",
      shareText:
        "You're invited to the wedding of Aarav & Diya\nSaturday, 21 November 2027 · 10:00 AM\nThe Royal Garden, Udayapuram\n\n#AaravWedDiya",
    },
  });

  const keepTitles = ["Botanical Parchment", "Twilight Fern"] as const;
  const [parchment, twilight] = await attachThemes(template, [...keepTitles], 0);
  const removedExtras = await ThemeModel.deleteMany({
    templateId: template._id,
    title: { $nin: [...keepTitles] },
  });

  const keepIds = new Set(
    [parchment, twilight].filter(Boolean).map((theme) => String(theme._id))
  );
  if (parchment && twilight) {
    const works = await WorkModel.find({ templateId: template._id });
    for (const work of works) {
      const currentId = work.selectedThemeId ? String(work.selectedThemeId) : "";
      if (!currentId || !keepIds.has(currentId)) {
        await WorkModel.findByIdAndUpdate(work._id, { selectedThemeId: parchment._id });
      }
    }
  }

  console.log(`Template ready: ${template.slug} -> category ${wedding.name}`);
  console.log(`BOTANICAL_PARCHMENT_THEME_ID=${parchment._id}`);
  console.log(`TWILIGHT_FERN_THEME_ID=${twilight._id}`);
  if (removedExtras.deletedCount) {
    console.log(`Removed extra botanical themes: ${removedExtras.deletedCount}`);
  }
  console.log(`Program events: ${programItems.length}`);
  console.log(`Itinerary stops: ${loveStoryItems.length}`);
  console.log(`Gallery slots: ${galleryItems.length} (media from DB/editor)`);
});
