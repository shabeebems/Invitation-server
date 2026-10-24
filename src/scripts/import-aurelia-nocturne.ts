import { ThemeModel } from "../models/theme.model";
import { WorkModel } from "../models/work.model";
import {
  attachThemes,
  ensureCategory,
  runImport,
  templateRepository,
} from "./_shared/seed-template";

runImport("Aurelia Nocturne", async () => {
  const wedding = await ensureCategory("Wedding");
  const existing = await templateRepository.findBySlug("aurelia-nocturne");
  const existingStory = existing?.content?.loveStoryItems || [];
  const existingGallery = existing?.content?.galleryItems || [];
  const existingProgram = existing?.content?.programItems || [];

  const venueMapsUrl = "https://www.google.com/maps/search/?api=1&query=Villa+Aurelia+Lake+Como+Italy";
  const programMeta = [
    {
      title: "The Ceremony",
      time: "4:30 PM",
      description:
        "Vows beneath the cypress terrace, as the afternoon light softens over the lake.",
      mapsUrl: venueMapsUrl,
    },
    {
      title: "The Reception",
      time: "6:30 PM",
      description: "Dinner, drinks and dancing beneath the stars in the villa gardens.",
      mapsUrl: venueMapsUrl,
    },
  ] as const;

  const programItems = programMeta.map((item, index) => {
    const prev = existingProgram[index];
    return {
      title: prev?.title || item.title,
      time: prev?.time || item.time,
      description: prev?.description || item.description,
      mapsUrl: prev?.mapsUrl ?? item.mapsUrl,
    };
  });

  const storyMeta = [
    {
      date: "2019",
      title: "First Met",
      place: "A delayed train in Milan, a shared umbrella and a talk that outlasted the rain.",
    },
    {
      date: "2021",
      title: "First Adventure",
      place: "A borrowed car, a coast road with no plan. Getting lost together was perfect.",
    },
    {
      date: "2024",
      title: "The Proposal",
      place: "At dawn on the water's edge, with the first light on the hills. She said yes!",
    },
    {
      date: "2027",
      title: "The Wedding",
      place: "A new chapter, same team. More love, more laughter, more adventures.",
    },
  ] as const;

  const loveStoryItems = storyMeta.map((item, index) => {
    const prev = existingStory[index];
    return {
      icon: "",
      date: prev?.date || item.date,
      title: prev?.title || item.title,
      place: prev?.place || item.place,
      url: prev?.url || "",
      publicId: prev?.publicId || "",
    };
  });

  const galleryMeta = [
    { caption: "Milan, 2019", title: "Milan", eyebrow: "2019" },
    { caption: "The coast road", title: "Coast", eyebrow: "Journey" },
    { caption: "Quiet mornings", title: "Mornings", eyebrow: "Home" },
    { caption: "The proposal", title: "Proposal", eyebrow: "Promise" },
    { caption: "Home, together", title: "Home", eyebrow: "Us" },
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
    slug: "aurelia-nocturne",
    name: "Aurelia Nocturne",
    description:
      "Cinematic midnight navy and champagne wedding with seal gate, landscape hero, staggered couple portraits, horizontal story frames, journey timeline, ivory venue cards, countdown, and editable dress code palette.",
    categoryId: wedding._id,
    isActive: true,
    content: {
      hostLabel: "You are invited",
      envelopeTagline: "request your presence",
      skipLabel: "Open the invitation",
      brideName: "Elena",
      groomName: "Alexander",
      introLine: "The beginning",
      inviteLine: "of forever",
      weekday: "Saturday",
      day: "18",
      monthYear: "July 2027",
      time: "At 4:30 PM",
      venueName: "Villa Aurelia",
      venueCity: "Lake Como, Italy",
      venueLabel: "Dress code",
      addressFull: "Villa Aurelia, Lake Como, Italy",
      mapsUrl: "https://www.google.com/maps/search/?api=1&query=Lake+Como+Italy",
      googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Lake+Como+Italy",
      getDirectionsLabel: "View location",
      meetCoupleTitle: "The couple",
      storyTitle: "Two stories. One beautiful beginning.",
      meetCoupleLayout: "staggered-duo",
      brideBio:
        "An architect from Florence who sketches every place she loves, and keeps a pressed flower in every notebook.",
      groomBio:
        "A cellist from Edinburgh with a quiet laugh, a terrible sense of direction, and a gift for finding the long way home.",
      galleryEyebrow: "Our story in frames",
      galleryTitle: "A quiet kind of magic",
      galleryIntro: "Some moments don't need words, they just need to be felt.",
      galleryLayout: "horizontal-rail",
      galleryItems,
      loveStoryTitle: "The journey",
      presenceLine: "How we got here",
      loveStoryLayout: "journey-timeline",
      loveStoryItems,
      programTitle: "The celebration",
      programIntro: "Two moments. One unforgettable day.",
      programItems,
      locationLayout: "ivory-cards",
      amenityThreeLabel: "The countdown",
      countdownHeading: "Until we say I do",
      countdownLiveLabel: "We're married!",
      countdownLayout: "tabular-quartet",
      eventDateIso: "2027-07-18T16:30:00+02:00",
      dressCode: "Black Tie",
      storyText:
        "Formal evening attire. Soft midnight, ivory and muted rose tones are most welcome.",
      storyLayout: "ringed-swatches",
      dressPaletteLabel: "Choose your colour",
      closingBlessing: "And so,\nour next chapter begins.",
      closingPresence: "Thank you for being part of our story.",
      replayLabel: "Return to the beginning",
      footerLayout: "scene-closing",
      footer: "Elena Rose & Alexander James · Lake Como, Italy",
      craftedBy: "#ElenaAndAlexander",
      heroLayout: "cinematic-scene",
      ambianceEffect: "sparkles",
      enabledSections: [
        "hero",
        "couple",
        "gallery",
        "story",
        "venue",
        "countdown",
        "dress",
        "final",
        "footer",
      ],
      shareText:
        "You're invited to the wedding of Elena & Alexander\nSaturday, 18 July 2027 · 4:30 PM\nVilla Aurelia, Lake Como, Italy\n\n#ElenaAndAlexander",
    },
  });

  const keepTitles = ["Aurelia Nocturne", "Emerald Noir", "Blush Daybreak"];
  const [nocturne, emerald, blush] = await attachThemes(template, keepTitles, 0);
  const removedThemes = await ThemeModel.deleteMany({
    templateId: template._id,
    title: { $nin: keepTitles },
  });

  const keepIds = [nocturne, emerald, blush].filter(Boolean).map((theme) => theme._id);
  if (nocturne) {
    const reassigned = await WorkModel.updateMany(
      { templateId: template._id, selectedThemeId: { $nin: keepIds } },
      { selectedThemeId: nocturne._id }
    );
    if (reassigned.modifiedCount) {
      console.log(`Moved ${reassigned.modifiedCount} work(s) to Aurelia Nocturne theme`);
    }
  }

  console.log(`Template ready: ${template.slug} -> category ${wedding.name}`);
  console.log(`AURELIA_NOCTURNE_THEME_ID=${nocturne._id}`);
  console.log(`EMERALD_NOIR_THEME_ID=${emerald._id}`);
  console.log(`BLUSH_DAYBREAK_THEME_ID=${blush._id}`);
  if (removedThemes.deletedCount) {
    console.log(`Removed extra themes: ${removedThemes.deletedCount}`);
  }
  console.log(`Milestones: ${loveStoryItems.length}; frames: ${galleryItems.length}; venue events: ${programItems.length}`);
});
