import {
  attachThemes,
  ensureCategory,
  runImport,
  templateRepository,
} from "./_shared/seed-template";

runImport("Velvet Heritage", async () => {
  const wedding = await ensureCategory("Wedding");
  const existing = await templateRepository.findBySlug("velvet-heritage");
  const existingStory = existing?.content?.loveStoryItems || [];
  const existingGallery = existing?.content?.galleryItems || [];

  // Text structure only — photos live in Cloudinary and are managed in the editor.
  const storyMeta = [
    {
      title: "First Meet",
      date: "5 Mar 2021",
      place: "Our paths crossed for the first time, and it felt like destiny.",
    },
    {
      title: "First Chat",
      date: "19 Apr 2021",
      place: "A simple message turned into a beautiful conversation.",
    },
    {
      title: "First Date",
      date: "7 Sep 2022",
      place: "We chose each other, again and again.",
    },
    {
      title: "Engagement",
      date: "12 Dec 2025",
      place: "A promise of forever, sealed with love.",
    },
    {
      title: "Our Wedding",
      date: "20 Feb 2027",
      place: "The beginning of our forever.",
    },
  ] as const;

  const loveStoryItems = storyMeta.map((item, index) => {
    const prev = existingStory[index];
    return {
      icon: "",
      title: item.title,
      date: item.date,
      place: item.place,
      url: prev?.url || "",
      publicId: prev?.publicId || "",
    };
  });

  const galleryMeta = [
    { eyebrow: "Mehndi", title: "Henna & bangles", caption: "Bridal details in burgundy and gold" },
    { eyebrow: "Golden hour", title: "Terrace sunset", caption: "Looking toward forever" },
    { eyebrow: "Promise", title: "Wedding bands", caption: "Gold on velvet" },
    { eyebrow: "Blooms", title: "Bouquet", caption: "Cream roses and burgundy dahlias" },
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
    slug: "velvet-heritage",
    name: "Velvet Heritage",
    description:
      "Cinematic burgundy velvet invitation with ivory panels, gold botanical accents, envelope opening, arch hero, countdown layouts, gallery layouts, and relationship timeline.",
    categoryId: wedding._id,
    isActive: true,
    content: {
      hashtag: "Our Wedding",
      hostLabel: "Together with their families",
      groomName: "Arjun",
      brideName: "Meera",
      introLine: "Invite you to celebrate their",
      inviteLine: "Wedding",
      storyText:
        "Two souls, one journey,\nand a lifetime of love ahead.\nWe would be honored to have you with us\non this special day.",
      presenceLine: "With lots of love",
      weekday: "Saturday",
      day: "20",
      monthYear: "February 2027",
      time: "At 11:00 AM",
      venueLabel: "Venue",
      venueName: "Lakeview Heritage Hall",
      venueCity: "Kochi, Kerala",
      addressFull: "Kochi, Kerala 682001, India",
      mapsUrl: "https://maps.google.com/?q=Lakeview+Heritage+Hall+Kochi",
      googleMapsUrl: "https://maps.google.com/?q=Lakeview+Heritage+Hall+Kochi",
      getDirectionsLabel: "Get Directions →",
      locationEyebrow: "Venue & Location",
      locationTitle: "Venue & Location",
      locationLayout: "atlas",
      amenityOneLabel: "Hotel",
      amenityOneDetail: "Available nearby",
      amenityTwoLabel: "Parking",
      amenityTwoDetail: "On-site parking",
      amenityThreeLabel: "Transport",
      amenityThreeDetail: "Easily accessible",
      envelopeTagline: "A Journey of Two Hearts",
      openHint: "Together Forever",
      skipLabel: "Skip →",
      eventDateIso: "2027-02-20T11:00:00+05:30",
      countdownHeading: "The big day is coming",
      countdownLiveLabel: "We're married!",
      countdownLayout: "gilded-rings",
      heroLayout: "arch",
      ambianceEffect: "petals",
      enabledSections: ["hero", "countdown", "gallery", "story", "location", "footer"],
      galleryEyebrow: "Our Gallery",
      galleryTitle: "Some moments, forever in our hearts…",
      galleryIntro: "",
      galleryLayout: "mosaic",
      galleryItems,
      loveStoryTitle: "Our Journey",
      storyTitle: "Relationship Timeline",
      meetCoupleIntro: "Two hearts. One beautiful journey.",
      loveStoryLayout: "rail",
      loveStoryItems,
      closingPresence: "Thank You",
      closingBlessing:
        "Your presence will make our celebration more special.\nWe look forward to celebrating with you!",
      footerLayout: "signature",
      footer: "© All rights reserved · Inviteo",
      shareText:
        "You're invited to the wedding of Arjun & Meera\nSaturday, 20 February 2027 · 11:00 AM\nLakeview Heritage Hall, Kochi, Kerala\n\nWe would be honored to have you with us.",
    },
  });

  const [burgundy, champagne] = await attachThemes(
    template,
    ["Burgundy Velvet", "Champagne Ivory"],
    0
  );

  console.log(`Template ready: ${template.slug} -> category ${wedding.name}`);
  console.log(`BURGUNDY_VELVET_THEME_ID=${burgundy._id}`);
  console.log(`CHAMPAGNE_IVORY_THEME_ID=${champagne._id}`);
  console.log(`Love story chapters: ${loveStoryItems.length} (media from DB/editor)`);
  console.log(`Gallery slots: ${galleryItems.length} (media from DB/editor)`);
});
