import {
  attachThemes,
  ensureCategory,
  runImport,
  templateRepository,
} from "./_shared/seed-template";

runImport("Palace Parchment", async () => {
  const wedding = await ensureCategory("Wedding");
  const existing = await templateRepository.findBySlug("palace-parchment");
  const existingStory = existing?.content?.loveStoryItems || [];
  const existingGallery = existing?.content?.galleryItems || [];

  const storyMeta = [
    {
      icon: "meet",
      title: "First Meet",
      date: "12 Jan 2020",
      place: "Our paths crossed for the first time, and it felt like destiny.",
    },
    {
      icon: "chat",
      title: "First Chat",
      date: "28 Feb 2021",
      place: "A simple message turned into a beautiful conversation.",
    },
    {
      icon: "date",
      title: "First Date",
      date: "14 Aug 2021",
      place: "We chose each other, again and again.",
    },
    {
      icon: "ring",
      title: "Engagement",
      date: "10 Dec 2023",
      place: "A promise of forever, sealed with love.",
    },
    {
      icon: "wedding",
      title: "Our Wedding",
      date: "22 Nov 2025",
      place: "The beginning of our forever.",
    },
  ] as const;

  const loveStoryItems = storyMeta.map((item, index) => {
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
    { eyebrow: "Details", title: "Mehendi Glow", caption: "Bridal henna and bangles" },
    {
      eyebrow: "Udaipur Moments",
      title: "Lakeside Serenity",
      caption: "Lake Pichola Sunset",
    },
    { eyebrow: "Promise", title: "Eternal Promise", caption: "Our wedding bands" },
    { eyebrow: "Ceremony", title: "Sacred Mandap", caption: "The royal mandap" },
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
    slug: "palace-parchment",
    name: "Palace Parchment",
    description:
      "Parchment wedding with sage and gold accents, royal palace double-door opening, arch hero, watercolor countdown, polaroid gallery, and icon timeline.",
    categoryId: wedding._id,
    isActive: true,
    content: {
      hashtag: "Our Wedding",
      hostLabel: "Together With Their Families",
      groomName: "Aarav",
      brideName: "Diya",
      groomLabel: "Cordially",
      brideLabel: "Invited",
      mashallahBadge: "The Royal Union",
      introLine: "Invite You To Celebrate Their",
      inviteLine: "Wedding",
      storyText:
        '"Two hearts, one journey, a lifetime of love ahead. We would be honored to have you with us on this special day."',
      presenceLine: "With Lots Of Love",
      weekday: "Saturday",
      day: "22",
      monthYear: "November 2025",
      time: "At 10:00 AM",
      venueLabel: "Venue",
      venueName: "The Royal Garden",
      venueCity: "Udaipur, Rajasthan",
      addressFull: "Udaipur, Rajasthan\n313001, India",
      mapsUrl: "https://maps.google.com/?q=The+Royal+Garden+Udaipur",
      googleMapsUrl: "https://maps.google.com/?q=The+Royal+Garden+Udaipur",
      getDirectionsLabel: "Get Directions",
      locationEyebrow: "Venue & Location",
      locationTitle: "Venue & Location",
      locationLayout: "card",
      envelopeTagline: "Open the doors to our forever",
      openHint: "Tap to Open",
      skipLabel: "Skip Intro →",
      eventDateIso: "2025-11-22T10:00:00+05:30",
      countdownHeading: "The Big Day Is Coming",
      countdownLiveLabel: "We're married!",
      countdownLayout: "watercolor",
      heroLayout: "split-arch",
      ambianceEffect: "petals",
      enabledSections: ["hero", "countdown", "gallery", "story", "location", "footer"],
      galleryEyebrow: "Our Gallery",
      galleryTitle: "Some Moments, Forever In Our Hearts...",
      galleryIntro: "",
      galleryLayout: "polaroid",
      galleryItems,
      loveStoryTitle: "Our Journey",
      storyTitle: "Relationship Timeline",
      loveStoryLayout: "icons",
      loveStoryItems,
      closingPresence: "Thank You",
      closingBlessing:
        '"Your presence will make our celebration more special. We look forward to celebrating with you!"',
      footerLayout: "duet",
      footer: "© 2025 Aarav & Diya • Celebrating A Royal Union",
      craftedBy: "#AaravWedDiya • #ForeverBeginsInUdaipur",
      shareText:
        "You're invited to the wedding of Aarav & Diya\nSaturday, 22 November 2025 · 10:00 AM\nThe Royal Garden, Udaipur, Rajasthan\n\n#AaravWedDiya #ForeverBeginsInUdaipur",
    },
  });

  const [parchment, sage] = await attachThemes(template, ["Palace Parchment", "Sage Olive"], 0);

  console.log(`Template ready: ${template.slug} -> category ${wedding.name}`);
  console.log(`PALACE_PARCHMENT_THEME_ID=${parchment._id}`);
  console.log(`SAGE_OLIVE_THEME_ID=${sage._id}`);
  console.log(`Love story chapters: ${loveStoryItems.length} (icons; media optional)`);
  console.log(`Gallery slots: ${galleryItems.length} (media from DB/editor)`);
});
