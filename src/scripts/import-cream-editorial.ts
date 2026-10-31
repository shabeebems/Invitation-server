import {
  attachThemes,
  ensureCategory,
  runImport,
  templateRepository,
} from "./_shared/seed-template";

runImport("Cream Editorial", async () => {
  const wedding = await ensureCategory("Wedding");
  const existing = await templateRepository.findBySlug("cream-editorial");
  const existingStory = existing?.content?.loveStoryItems || [];
  const existingGallery = existing?.content?.galleryItems || [];
  const existingProgram = existing?.content?.programItems || [];
  const programMeta = [
    {
      title: "Ceremony",
      time: "4:00 PM",
      description: "Vows beneath the cypress arch. · Rose Garden",
    },
    {
      title: "Cocktails",
      time: "5:00 PM",
      description: "Aperitivo, strings and lake views. · Lemon Terrace",
    },
    {
      title: "Dinner & Dancing",
      time: "7:00 PM",
      description: "Long tables, toasts and a late band. · Orangery",
    },
  ] as const;

  const programItems = programMeta.map((item, index) => {
    const prev = existingProgram[index];
    return {
      title: prev?.title || item.title,
      time: prev?.time || item.time,
      description: prev?.description || item.description,
      ...(prev?.url ? { url: prev.url, publicId: prev.publicId || "" } : {}),
    };
  });

  const storyMeta = [
    {
      icon: "",
      date: "2019",
      title: "We met",
      place: "A rainy bookshop in Lisbon, one umbrella and a disputed copy of the same novel.",
    },
    {
      icon: "",
      date: "2021",
      title: "Moved in",
      place: "Two plants, one cello and far too many teacups.",
    },
    {
      icon: "",
      date: "2025",
      title: "The proposal",
      place: "A quiet cliff path at dawn, a borrowed ring box and a very emphatic yes.",
    },
    {
      icon: "",
      date: "2027",
      title: "Forever, begins",
      place: "Surrounded by everyone who has made us who we are.",
    },
    {
      icon: "faq",
      date: "",
      title: "What time should we arrive?",
      place: "Please arrive by 3:30 PM so you’re seated before the ceremony begins.",
    },
    {
      icon: "faq",
      date: "",
      title: "Are children welcome?",
      place: "We love your little ones, but this is an adults-only celebration.",
    },
    {
      icon: "faq",
      date: "",
      title: "Can you accommodate dietary needs?",
      place: "Yes. Let us know ahead of time and we’ll make sure you’re looked after.",
    },
    {
      icon: "faq",
      date: "",
      title: "Can I take photos?",
      place: "We’ve hired a photographer, so please keep phones away during the ceremony.",
    },
    {
      icon: "faq",
      date: "",
      title: "What if it rains?",
      place: "The orangery is our covered backup, so the day goes ahead either way.",
    },
  ] as const;

  const loveStoryItems = storyMeta.map((item, index) => {
    const prev = existingStory[index];
    return {
      icon: prev?.icon || item.icon,
      date: prev?.date || item.date,
      title: prev?.title || item.title,
      place: prev?.place || item.place,
      url: prev?.url || "",
      publicId: prev?.publicId || "",
    };
  });

  const galleryMeta = [
    { eyebrow: "1:2", title: "Bride", caption: "The Bride" },
    { eyebrow: "1:1", title: "Groom", caption: "The Groom" },
    { eyebrow: "2:1", title: "Love", caption: "Our Love" },
    { eyebrow: "3:2", title: "Walk", caption: "Beautiful Moments" },
    { eyebrow: "3:2", title: "Lake", caption: "Sunset Promise" },
    { eyebrow: "1:1", title: "Rings", caption: "Forever Begins" },
    { eyebrow: "2:1", title: "Mehndi", caption: "Mehndi" },
    { eyebrow: "1:2", title: "Together", caption: "Together" },
  ] as const;

  const galleryItems = galleryMeta.map((item, index) => {
    const prev = existingGallery[index];
    return {
      eyebrow: prev?.eyebrow || item.eyebrow,
      title: prev?.title || item.title,
      caption: prev?.caption || item.caption,
      url: prev?.url || "",
      publicId: prev?.publicId || "",
    };
  });

  const template = await templateRepository.upsertBySlug({
    slug: "cream-editorial",
    name: "Cream Editorial",
    description:
      "Ivory and cream garden wedding with split-door cover, twin-arch hero portraits, offset couple portraits, year-rail love story, editorial mosaic gallery, trio events, split venue, rose-band countdown, dress palette with travel notes, and FAQ accordion.",
    categoryId: wedding._id,
    isActive: true,
    content: {
      hostLabel: "Together with their families",
      skipLabel: "Open Invitation",
      brideName: "Isabel",
      groomName: "Julian",
      introLine: "Two souls ◆ One journey",
      heroScript: "Save the Date",
      heroSideNote: "Same Love New Chapter",
      heroCtaLabel: "Explore Our Journey",
      weekday: "Saturday",
      day: "12",
      monthYear: "June 2027",
      time: "At 4:00 PM",
      venueName: "Villa Placeholder",
      venueCity: "Demo Gardens, Example Lake, Italy",
      addressFull: "1 Sample Lane (demo address)",
      mapsUrl: "https://www.google.com/maps/search/?api=1&query=Lake+Como+Italy",
      googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Lake+Como+Italy",
      getDirectionsLabel: "Get directions",
      locationTitle: "The venue",
      locationLayout: "split-venue",
      presenceLine: "Your presence is the gift we are most looking forward to.",
      meetCoupleIntro:
        "After years of shared Sundays, borrowed jumpers and one very long train ride, we are marrying our best friend. We would be honoured to have you beside us.",
      meetCoupleTitle: "Meet the couple",
      storyTitle: "Two people, one story",
      coupleTagline: "Two hearts, one journey, a lifetime of love.",
      storySideNote: "Same Love Different Chapter",
      storyScriptNote: "Better Together",
      galleryLead: "Tiny moments, big emotions — a collection of memories from our journey together.",
      galleryScript: "Memories forever",
      gallerySideNote: "Same Love Different Moments",
      eventsLead: "Three beautiful moments, one unforgettable day.",
      meetCoupleLayout: "offset-portraits",
      brideLabel: "The bride",
      groomLabel: "The groom",
      brideBio:
        "Architect, bread-baker, collector of pressed flowers. She says yes to every detour.",
      groomBio:
        "Cellist and terrible map-reader. He hums while he cooks and cries at weddings.",
      loveStoryTitle: "Our love story",
      envelopeTagline: "How we got here",
      loveStoryLayout: "year-rail",
      loveStoryItems,
      galleryEyebrow: "Memories",
      galleryTitle: "Little moments",
      galleryLayout: "editorial-mosaic",
      galleryIntro: "centered-ornament",
      galleryItems,
      programTitle: "The celebration",
      programLayout: "trio-schedule",
      programItems,
      programEyebrow: "Good to know",
      programIntro: "Questions, answered",
      amenityThreeLabel: "Until we say “I do”",
      countdownHeading: "Counting the moments",
      countdownLiveLabel: "We’re married!",
      countdownLayout: "rose-band",
      eventDateIso: "2027-06-12T16:00:00+02:00",
      venueLabel: "Dress code",
      dressCode: "Garden formal",
      dressPaletteLabel: existing?.content?.dressPaletteLabel || "Our palette",
      dressColors:
        existing?.content?.dressColors ||
        "#fbf7f0|Ivory,#a8ae96|Sage,#d8b8ad|Dusty rose,#c6a779|Champagne,#7a5f4c|Cocoa",
      storyText:
        "Soft, romantic tones. Think linen, silk and florals; flat or block heels suit the gravel paths.",
      storyLayout: "two-column",
      locationEyebrow: "Travel & stay",
      amenityOneLabel: "Stay",
      amenityOneDetail:
        "A block of demo rooms is held at Hotel Example. Mention the wedding when booking.",
      amenityTwoLabel: "Shuttles",
      amenityTwoDetail:
        "Complimentary shuttles leave the hotel at 3:00 PM and return at midnight.",
      destinationLabel: "Parking",
      addressShort: "Limited on-site parking. Carpooling is encouraged.",
      amenityThreeDetail: "Airport",
      copyAddressLabel: "Nearest airport is about 90 minutes by road (demo).",
      viewPhotoLabel: "accordion",
      closingBlessing: "Thank you for being part of us",
      closingPresence:
        "However you celebrate with us, near or far, we’re grateful for you.",
      replayLabel: "Back to top",
      footerLayout: "sage-close",
      footer: "Isabel & Julian · Demo Gardens, Italy",
      craftedBy: "minimal",
      heroLayout: "twin-arch",
      ambianceEffect: "none",
      enabledSections: [
        "hero",
        "welcome",
        "couple",
        "story",
        "gallery",
        "events",
        "location",
        "countdown",
        "dress",
        "faq",
        "final",
        "footer",
      ],
      shareText:
        "You’re invited to the wedding of Isabel & Julian\nSaturday, 12 June 2027 · 4:00 PM\nVilla Placeholder, Demo Gardens, Italy\n\n#IsabelAndJulian",
    },
  });

  const [cream, sage] = await attachThemes(
    template,
    ["Cream Ivory", "Garden Sage"],
    0
  );

  console.log(`Template ready: ${template.slug} -> category ${wedding.name}`);
  console.log(`CREAM_IVORY_THEME_ID=${cream._id}`);
  console.log(`GARDEN_SAGE_THEME_ID=${sage._id}`);
  console.log(
    `Milestones: ${loveStoryItems.filter((i) => i.icon !== "faq").length}; FAQ: ${loveStoryItems.filter((i) => i.icon === "faq").length}; frames: ${galleryItems.length}; events: ${programItems.length}`
  );
});
