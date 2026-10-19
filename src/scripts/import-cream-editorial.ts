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
  const existingLocations = existing?.content?.locationItems || [];

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
      place: "Yes. Tell us in the RSVP form and we’ll make sure you’re looked after.",
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
    { eyebrow: "t", title: "Lisbon", caption: "Lisbon, 2019" },
    { eyebrow: "", title: "Market", caption: "Sunday market" },
    { eyebrow: "w2", title: "Cliff", caption: "The cliff path" },
    { eyebrow: "t", title: "Proposal", caption: "Proposal morning" },
    { eyebrow: "", title: "Home", caption: "Home" },
    { eyebrow: "w2", title: "Summer", caption: "Italian summer" },
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

  const scheduleMeta = [
    { label: "3:30 PM", title: "Guests arrive & are seated" },
    { label: "4:00 PM", title: "Ceremony" },
    { label: "5:00 PM", title: "Cocktail hour & photographs" },
    { label: "7:00 PM", title: "Dinner is served" },
    { label: "9:00 PM", title: "First dance" },
    { label: "11:30 PM", title: "Last song & farewell" },
  ] as const;

  const locationItems = scheduleMeta.map((item, index) => {
    const prev = existingLocations[index];
    return {
      label: prev?.label || item.label,
      title: prev?.title || item.title,
      address: prev?.address || "",
      mapsUrl: prev?.mapsUrl || "",
    };
  });

  const template = await templateRepository.upsertBySlug({
    slug: "cream-editorial",
    name: "Cream Editorial",
    description:
      "Ivory and cream garden wedding with split-door cover, arch hero portrait, offset couple portraits, year-rail love story, editorial mosaic gallery, trio events with hour-by-hour schedule, split venue, rose-band countdown, dress palette with travel notes, FAQ accordion, and outlined RSVP.",
    categoryId: wedding._id,
    isActive: true,
    content: {
      hostLabel: "Together with their families",
      skipLabel: "Open Invitation",
      brideName: "Isabel",
      groomName: "Julian",
      introLine: "We’re getting married",
      inviteLine:
        "Join us for a day of garden vows, long tables and golden-hour dancing.",
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
      locationItems,
      amenityThreeLabel: "Until we say “I do”",
      countdownHeading: "Counting the moments",
      countdownLiveLabel: "We’re married!",
      countdownLayout: "rose-band",
      eventDateIso: "2027-06-12T16:00:00+02:00",
      venueLabel: "Dress code",
      dressCode: "Garden formal",
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
      rsvpNote: "Kindly reply by 1 May 2027",
      openHint: "Send RSVP",
      quoteLayout: "outlined-card",
      closingBlessing: "Thank you for being part of us",
      closingPresence:
        "However you celebrate with us, near or far, we’re grateful for you.",
      replayLabel: "Back to top",
      footerLayout: "sage-close",
      footer: "Isabel & Julian · Demo Gardens, Italy",
      craftedBy: "minimal",
      heroLayout: "split-arch",
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
        "rsvp",
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
    `Milestones: ${loveStoryItems.filter((i) => i.icon !== "faq").length}; FAQ: ${loveStoryItems.filter((i) => i.icon === "faq").length}; frames: ${galleryItems.length}; events: ${programItems.length}; schedule: ${locationItems.length}`
  );
});
