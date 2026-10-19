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
      "Deep ruby and gold foil wedding with envelope seal opening, spinning mandala hero, marigold petal ambiance, dual-folio blessings, gold-ring countdown, flip celebration cards, venue, and formal RSVP.",
    categoryId: wedding._id,
    isActive: true,
    content: {
      hashtag: "Save the date",
      hostLabel: "Together with their families",
      brideName: "Ananya",
      groomName: "Arjun",
      introLine: "The wedding of",
      skipLabel: "TAP THE SEAL",
      openHint: "SEND REPLY",
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
      locationEyebrow: "Will you join us?",
      locationLayout: "centered-venue",
      rsvpNote: "Kindly reply by 20 January 2027.",
      quoteLayout: "formal-reply",
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
        "blessings",
        "countdown",
        "events",
        "location",
        "rsvp",
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

  const [ruby, ember] = await attachThemes(template, ["Royal Ruby", "Ember Gold"], 0);

  console.log(`Template ready: ${template.slug} -> category ${wedding.name}`);
  console.log(`ROYAL_RUBY_THEME_ID=${ruby._id}`);
  console.log(`EMBER_GOLD_THEME_ID=${ember._id}`);
  console.log(`Celebration cards: ${programItems.length}`);
});
