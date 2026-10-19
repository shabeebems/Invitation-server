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
  const existingProgram = existing?.content?.programItems || [];

  const programMeta = [
    {
      title: "Mehendi",
      time: "21 Nov 2025, Friday • 4:00 PM",
      description: "The Royal Garden, Udayapuram",
    },
    {
      title: "Sangeet",
      time: "21 Nov 2025, Friday • 7:00 PM",
      description: "The Royal Garden, Udayapuram",
    },
    {
      title: "Wedding Ceremony",
      time: "22 Nov 2025, Saturday • 10:00 AM",
      description: "The Royal Garden, Udayapuram",
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

  const itineraryMeta = [
    {
      icon: "arrival",
      title: "Arrival",
      date: "21 Nov, 2025 • 2:00 PM",
      place: "welcoming celebrations",
    },
    {
      icon: "celebration",
      title: "Celebration",
      date: "21–22 Nov, 2025 • 7:00 PM",
      place: "Let's celebrate together!",
    },
    {
      icon: "farewell",
      title: "Farewell",
      date: "23 Nov, 2025 • 10:00 AM",
      place: "Until we meet again!",
    },
  ] as const;

  const loveStoryItems = itineraryMeta.map((item, index) => {
    const prev = existingStory[index];
    return {
      icon: item.icon,
      title: prev?.title || item.title,
      date: prev?.date || item.date,
      place: prev?.place || item.place,
      url: prev?.url || "",
      publicId: prev?.publicId || "",
    };
  });

  const galleryMeta = [
    { eyebrow: "Tradition", title: "Diya Glow", caption: "Brass lamp and marigolds" },
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
      "Elegant parchment wedding with Great Vibes calligraphy, botanical side sprigs, arch hero, story narrative, event trio, burgundy quote banner, five-column mosaic gallery, weekend itinerary, family party row, and travel RSVP.",
    categoryId: wedding._id,
    isActive: true,
    content: {
      hashtag: "AD",
      hostLabel: "22 NOVEMBER 2025 • UDAYAPURAM, KERALA",
      groomName: "Aarav",
      brideName: "Diya",
      groomLabel: "The Groom",
      brideLabel: "The Bride",
      introLine: "Together is our favourite place to be.\nJoin us as we begin our forever.",
      openHint: "RSVP",
      inviteLine: "Wedding",
      weekday: "Saturday",
      day: "22",
      monthYear: "November 2025",
      time: "At 10:00 AM",
      venueLabel: "Dress Code",
      venueName: "The Royal Garden",
      venueCity: "Udayapuram, Rajasthan",
      dressCode: "Traditional / Festive",
      addressFull:
        "If you wish to bless us with a gift, we have created a registry for your convenience.",
      mapsUrl: "https://maps.google.com/?q=The+Royal+Garden+Udayapuram",
      googleMapsUrl: "https://maps.google.com/?q=The+Royal+Garden+Udayapuram",
      getDirectionsLabel: "Send RSVP",
      copyAddressLabel: "View Registry",
      destinationLabel: "Your presence is the greatest gift!",
      locationTitle: "Travel & Accommodation",
      locationIntro: "We'd love to know if you can join us for our special day!",
      locationLayout: "map-rsvp",
      rsvpNote: "Kindly RSVP",
      meetCoupleTitle: "A Little About Us",
      storyTitle: "Two Hearts, One Journey",
      storyText:
        "From countless conversations to a lifetime of dreams, Aarav and Diya found in each other a love that feels like home.",
      meetCoupleIntro:
        "Through every laugh, every challenge and every little moment, we chose each other — and now, we choose forever.",
      presenceLine: "Our story continues...",
      storyLayout: "arch-narrative",
      meetCoupleLayout: "party-row",
      brideParentsLabel: "Our Family & Wedding Party",
      amenityOneLabel: "Our Parents",
      amenityOneDetail: "Who made this day possible",
      amenityTwoLabel: "Our Parents",
      amenityTwoDetail: "Our biggest supporters",
      amenityThreeLabel: "With love",
      amenityThreeDetail: "",
      programEyebrow: "Wedding Events",
      programLayout: "trio-cards",
      programItems,
      blessing:
        "“A new chapter begins, with the blessings of our loved ones.”",
      quoteLayout: "burgundy-banner",
      galleryEyebrow: "Our Gallery",
      galleryTitle: "Our Gallery",
      galleryIntro: "",
      galleryLayout: "mosaic-five",
      galleryItems,
      loveStoryTitle: "Weekend Itinerary",
      loveStoryLayout: "rail-three",
      loveStoryItems,
      heroLayout: "split-cta",
      ambianceEffect: "leaves",
      eventDateIso: "2025-11-22T10:00:00+05:30",
      enabledSections: [
        "hero",
        "story",
        "events",
        "quote",
        "gallery",
        "itinerary",
        "family",
        "travel",
        "footer",
      ],
      closingPresence: "Thank You",
      footer: "for being a part of our journey. We can't wait to celebrate with you!",
      footerLayout: "grove",
      craftedBy: "#AaravWedDiya • #BotanicalScript",
      shareText:
        "You're invited to the wedding of Aarav & Diya\nSaturday, 22 November 2025 · 10:00 AM\nThe Royal Garden, Udayapuram\n\n#AaravWedDiya",
    },
  });

  const [parchment, forest] = await attachThemes(
    template,
    ["Botanical Parchment", "Forest Grove"],
    0
  );

  console.log(`Template ready: ${template.slug} -> category ${wedding.name}`);
  console.log(`BOTANICAL_PARCHMENT_THEME_ID=${parchment._id}`);
  console.log(`FOREST_GROVE_THEME_ID=${forest._id}`);
  console.log(`Program events: ${programItems.length}`);
  console.log(`Itinerary stops: ${loveStoryItems.length}`);
  console.log(`Gallery slots: ${galleryItems.length} (media from DB/editor)`);
});
