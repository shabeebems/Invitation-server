import { ThemeModel } from "../models/theme.model";
import { WorkModel } from "../models/work.model";
import {
  attachThemes,
  ensureCategory,
  runImport,
  templateRepository,
} from "./_shared/seed-template";

runImport("Royal Ruby", async () => {
  const wedding = await ensureCategory("Wedding");
  const existing = await templateRepository.findBySlug("royal-ruby");
  const existingProgram = existing?.content?.programItems || [];
  const existingGallery = existing?.content?.galleryItems || [];

  const galleryMeta = [
    { title: "Haldi Glow", caption: "Turmeric & laughter" },
    { title: "Mehendi Hands", caption: "Stories in henna" },
    { title: "Sacred Vows", caption: "Under the mandap" },
    { title: "Garland Exchange", caption: "Jaimala moment" },
    { title: "Golden Hour", caption: "Just the two of us" },
    { title: "Forever Begins", caption: "Our first dance" },
  ] as const;

  const galleryItems = galleryMeta.map((item, index) => {
    const prev = existingGallery[index];
    return {
      eyebrow: prev?.eyebrow || "",
      title: prev?.title || item.title,
      caption: prev?.caption || item.caption,
      url: prev?.url || "",
      publicId: prev?.publicId || "",
    };
  });

  const programMeta = [
    {
      time: "13|FEBRUARY",
      title: "Mehendi & Sangeet",
      description: "5:00 pm onwards\nHenna, music and dancing with family at The Grand Lawns.",
    },
    {
      time: "14|FEBRUARY",
      title: "The Wedding",
      description: "10:30 am, Muhurtham\nThe ceremony followed by the wedding feast.",
    },
    {
      time: "14|FEBRUARY",
      title: "Reception",
      description: "7:00 pm onwards\nDinner, blessings and a night to remember.",
    },
  ] as const;

  const programItems = programMeta.map((item, index) => {
    const prev = existingProgram[index];
    return {
      time: prev?.time || item.time,
      title: prev?.title || item.title,
      description: prev?.description || item.description,
    };
  });

  const template = await templateRepository.upsertBySlug({
    slug: "royal-ruby",
    name: "Royal Ruby",
    description:
      "Deep ruby and gold foil wedding with slide-out keepsake box opening, spinning mandala hero, marigold petal ambiance, dual-folio blessings, gold-ring countdown, flip celebration cards, venue, and gold arch gallery.",
    categoryId: wedding._id,
    isActive: true,
    content: {
      hashtag: "Save the date",
      hostLabel: "Together with their families",
      brideName: "Ananya",
      groomName: "Arjun",
      introLine: "The wedding of",
      envelopeTagline: "A Journey of Two Hearts",
      openHint: "Together Forever",
      inviteLine: "You're\nInvited",
      skipLabel: "Slide the box to open your invitation",
      weekday: "Sunday",
      day: "14",
      monthYear: "02 · 2027",
      time: "At 10:30 AM",
      venueName: "The Grand Lawns",
      venueCity: "Thrissur, Kerala",
      addressFull: "Swaraj Round, Thrissur, Kerala 680001",
      mapsUrl: "https://www.google.com/maps/search/?api=1&query=Swaraj+Round+Thrissur",
      googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Swaraj+Round+Thrissur",
      getDirectionsLabel: "OPEN IN MAPS",
      locationTitle: "The venue",
      locationLayout: "centered-venue",
      galleryTitle: "Our Gallery",
      galleryIntro: "Little moments of love, laughter and blessings we will cherish forever.",
      galleryCtaLabel: "View full gallery",
      galleryLayout: "arch-gallery",
      galleryItems,
      storyTitle: "Our Story",
      storyText:
        "What began as a chance meeting turned into a lifetime of laughter, long talks and quiet promises. Through every season, we found home in each other — and now, surrounded by the people we love most, we are ready to begin our forever.",
      presenceLine: "Ananya & Arjun",
      storyLayout: "arch-story",
      meetCoupleTitle: "With blessings of",
      meetCoupleIntro:
        "Together with the blessings of our parents and elders, we joyfully invite you to share in our celebration of love.",
      meetCoupleLayout: "dual-folio",
      brideParentsLabel: "Parents of the bride",
      brideParents: "Mr. & Mrs. Menon",
      brideDetail: "Add the family names here",
      groomLabel: "Parents of the groom",
      hostNames: "Mr. & Mrs. Nair",
      groomDetail: "Add the family names here",
      countdownHeading: "Until we say I do",
      countdownSubtitle: "Our special day is coming",
      countdownLiveLabel: "We're married!",
      countdownLayout: "gold-rings",
      eventDateIso: "2027-02-14T10:30:00+05:30",
      programTitle: "The celebrations",
      programIntro: "Tap a card to see the details.",
      programLayout: "flip-cards",
      programItems,
      heroLayout: "mandala-foil",
      ambianceEffect: "petals",
      enabledSections: [
        "hero",
        "story",
        "countdown",
        "blessings",
        "events",
        "location",
        "gallery",
        "footer",
      ],
      closingPresence: "WE CAN'T WAIT TO SEE YOU",
      footer: "© Ananya & Arjun · Royal Ruby",
      footerLayout: "diya-signature",
      craftedBy: "#AnanyaWedsArjun",
      shareText:
        "You're invited to the wedding of Ananya & Arjun\n14 February 2027 · 10:30 AM\nThe Grand Lawns, Thrissur, Kerala\n\n#AnanyaWedsArjun",
    },
  });

  const keepTitles = ["Royal Ruby", "Ivory Rosé", "Midnight Sapphire"];
  const [ruby, rose, sapphire] = await attachThemes(template, keepTitles, 0);
  const removedThemes = await ThemeModel.deleteMany({
    templateId: template._id,
    title: { $nin: keepTitles },
  });

  const keepIds = [ruby, rose, sapphire].filter(Boolean).map((theme) => theme._id);
  if (ruby) {
    const reassigned = await WorkModel.updateMany(
      { templateId: template._id, selectedThemeId: { $nin: keepIds } },
      { selectedThemeId: ruby._id }
    );
    if (reassigned.modifiedCount) {
      console.log(`Moved ${reassigned.modifiedCount} work(s) to Royal Ruby theme`);
    }
  }

  console.log(`Template ready: ${template.slug} -> category ${wedding.name}`);
  console.log(`ROYAL_RUBY_THEME_ID=${ruby._id}`);
  console.log(`IVORY_ROSE_THEME_ID=${rose._id}`);
  console.log(`MIDNIGHT_SAPPHIRE_THEME_ID=${sapphire._id}`);
  if (removedThemes.deletedCount) {
    console.log(`Removed extra themes: ${removedThemes.deletedCount}`);
  }
  console.log(`Celebration cards: ${programItems.length}`);
  console.log(`Gallery slots: ${galleryItems.length} (media from DB/editor)`);
});
