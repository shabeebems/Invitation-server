import {
  attachThemes,
  ensureCategory,
  runImport,
  templateRepository,
} from "./_shared/seed-template";

runImport("Royal Reception", async () => {
  const wedding = await ensureCategory("Wedding");
  const existing = await templateRepository.findBySlug("royal-reception");
  const existingStory = existing?.content?.loveStoryItems || [];
  const existingGallery = existing?.content?.galleryItems || [];

  // Text structure only — photos live in Cloudinary and are managed in the editor.
  // Re-seeds keep any urls/publicIds already saved in the database.
  const storyMeta = [
    { title: "Hello", date: "March 2019", place: "Family gathering, Kozhikode" },
    { title: "First conversation", date: "April 2019", place: "A quiet evening call" },
    { title: "First date", date: "June 2019", place: "Seaside café, Calicut" },
    { title: "Our first home", date: "August 2022", place: "A key to forever" },
    { title: "The proposal", date: "January 2025", place: "Under the evening sky" },
    { title: "Engagement day", date: "March 2025", place: "With our families" },
    { title: "Wedding day", date: "December 2026", place: "Grand Palace, Kozhikode" },
    { title: "Walima celebration", date: "December 2026", place: "Grand Palace Auditorium" },
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
    { eyebrow: "Soft light", title: "Pure happiness", caption: "A quiet glance before forever" },
    { eyebrow: "Together", title: "Hand in hand", caption: "Walking into our next chapter" },
    { eyebrow: "Promise", title: "Forever & always", caption: "The vow written in our eyes" },
    { eyebrow: "Golden hour", title: "Adventure together", caption: "Sunlit moments we keep" },
    { eyebrow: "Details", title: "Little wonders", caption: "Rings, florals, and quiet joy" },
    { eyebrow: "Celebration", title: "Best day yet", caption: "Laughter shared with loved ones" },
    { eyebrow: "Portrait", title: "Two hearts", caption: "Framed in gold and grace" },
    { eyebrow: "Blessing", title: "Alhamdulillah", caption: "Grateful for every step" },
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
    slug: "royal-reception",
    name: "Royal Reception",
    description:
      "Dark maroon invitation with gold script, couple portraits, love journey, and a choosable pre-wedding gallery.",
    categoryId: wedding._id,
    isActive: true,
    content: {
      bismillah: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
      hostLabel: "With the blessings of Allah, the family of",
      hostNames: "Mr. Abdul Rahman & Mrs. Amina",
      introLine: "joyfully welcome you to the wedding reception of their son",
      groomName: "Ibrahim",
      brideName: "Aisha",
      brideParentsLabel: "Daughter of",
      brideParents: "Mr. Nizar Ahmed & Mrs. Suhara Nizar",
      presenceLine: "Your presence and blessings will make this occasion even more special",
      weekday: "Friday",
      day: "25",
      monthYear: "December 2026",
      time: "At 11:00 AM",
      venueLabel: "Venue",
      venueName: "Grand Palace",
      venueHall: "Auditorium",
      venueCity: "Kozhikode",
      mapsUrl: "https://www.google.com/maps/search/?api=1&query=Grand%20Palace%20Auditorium%20Kozhikode",
      hashtag: "#IbrahimWedsAisha",
      blessing: "May Allah bless this union and fill it with love, mercy and tranquility.",
      inviteLine: "Kindly grace the occasion with your presence and duas",
      footer: "© All rights reserved · Save the Kath",
      envelopeTagline: "An invitation awaits",
      openHint: "Tap the seal to open",
      eventDateIso: "2026-12-25T11:00:00+05:30",
      countdownHeading: "The big day is almost here",
      countdownLiveLabel: "Alhamdulillah — we're married!",
      countdownLayout: "classic",
      ambianceEffect: "petals",
      enabledSections: [
        "hero",
        "countdown",
        "couple",
        "story",
        "gallery",
        "location",
        "footer",
      ],
      meetCoupleTitle: "Meet the Couple",
      meetCoupleIntro: "Two hearts, one journey — a few words about the bride and groom.",
      meetCoupleLayout: "classic",
      groomLabel: "The Groom",
      groomBio:
        "Ibrahim is warm-hearted and quietly steadfast — happiest when family is close and laughter fills the room.",
      groomDetail: "Loves classic poetry · Morning walks · Strong coffee",
      brideLabel: "The Bride",
      brideBio:
        "Aisha brings light into every gathering — graceful, thoughtful, and endlessly kind to those she loves.",
      brideDetail: "Loves florals · Soft melodies · Evening chai",
      loveStoryTitle: "Our journey so far",
      loveStoryLayout: "journey",
      loveStoryItems,
      galleryEyebrow: "Pre-Wedding",
      galleryTitle: "Photo Gallery",
      galleryIntro: "A few golden frames from our journey — tap any photo to expand.",
      galleryLayout: "masonry",
      galleryItems,
      locationEyebrow: "Find us",
      locationTitle: "Venue & Directions",
      locationIntro: "Choose the function below for the map, directions, and a shareable location link.",
      locationLayout: "split",
      destinationLabel: "Destination",
      googleMapsUrl:
        "https://www.google.com/maps/search/?api=1&query=Grand%20Palace%20Auditorium%20Kozhikode",
      locationItems: [
        {
          label: "Nikah",
          title: "Grand Palace — Main Hall",
          address: "Grand Palace, Kozhikode, Kerala",
          mapsUrl: "https://www.google.com/maps/search/?api=1&query=Grand%20Palace%20Kozhikode",
        },
        {
          label: "Reception",
          title: "Grand Palace — Auditorium",
          address: "Grand Palace Auditorium, Kozhikode, Kerala",
          mapsUrl:
            "https://www.google.com/maps/search/?api=1&query=Grand%20Palace%20Auditorium%20Kozhikode",
        },
        {
          label: "Walima",
          title: "Grand Palace — Banquet Lawn",
          address: "Grand Palace Grounds, Kozhikode, Kerala",
          mapsUrl: "https://www.google.com/maps/search/?api=1&query=Grand%20Palace%20Kozhikode%20Kerala",
        },
      ],
      shareText:
        "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\n\nYou're invited to the wedding reception of Ibrahim & Aisha\nHosted by the family of Mr. Abdul Rahman & Mrs. Amina\nFriday, 25 December 2026 · 11:00 AM\nGrand Palace — Auditorium, Kozhikode\n\nPlease join us with your duas 🤲",
    },
  });

  const [redVelvet, emerald] = await attachThemes(template, ["Red Velvet", "Emerald Grove"], 0);

  console.log(`Template ready: ${template.slug} -> category ${wedding.name}`);
  console.log(`RED_VELVET_THEME_ID=${redVelvet._id}`);
  console.log(`EMERALD_GROVE_THEME_ID=${emerald._id}`);
  console.log(`Love story chapters: ${loveStoryItems.length} (media from DB/editor)`);
  console.log(`Gallery slots: ${galleryItems.length} (media from DB/editor)`);
});
