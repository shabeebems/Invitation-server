import {
  attachThemes,
  ensureCategory,
  runImport,
  templateRepository,
  uploadRemoteImage,
} from "./_shared/seed-template";

/** Free Unsplash photos for the love-story timeline. */
const STORY_IMAGES = [
  "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=900&q=80",
] as const;

/** Pre-wedding gallery photos (romantic couple / ceremony moments). */
const GALLERY_IMAGES = [
  "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1100&q=80",
  "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1100&q=80",
  "https://images.unsplash.com/photo-1529636798458-92182e662485?auto=format&fit=crop&w=1100&q=80",
  "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1100&q=80",
  "https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=1100&q=80",
  "https://images.unsplash.com/photo-1460978812857-470ed1c77af0?auto=format&fit=crop&w=1100&q=80",
  "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1100&q=80",
  "https://images.unsplash.com/photo-1545232979-8bf68ee9b1af?auto=format&fit=crop&w=1100&q=80",
] as const;

runImport("Royal Reception", async () => {
  const wedding = await ensureCategory("Wedding");

  const [hero, groom, bride, ...rest] = await Promise.all([
    uploadRemoteImage(
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1400&q=85"
    ),
    uploadRemoteImage(
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80"
    ),
    uploadRemoteImage(
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80"
    ),
    ...STORY_IMAGES.map((url) => uploadRemoteImage(url)),
    ...GALLERY_IMAGES.map((url) => uploadRemoteImage(url)),
  ]);

  const storyUploads = rest.slice(0, STORY_IMAGES.length);
  const galleryUploads = rest.slice(STORY_IMAGES.length);

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

  const loveStoryItems = storyMeta.map((item, index) => ({
    icon: "",
    title: item.title,
    date: item.date,
    place: item.place,
    url: storyUploads[index]?.url || "",
    publicId: storyUploads[index]?.publicId || "",
  }));

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

  const galleryItems = galleryMeta.map((item, index) => ({
    eyebrow: item.eyebrow,
    title: item.title,
    caption: item.caption,
    url: galleryUploads[index]?.url || "",
    publicId: galleryUploads[index]?.publicId || "",
  }));

  const template = await templateRepository.upsertBySlug({
    slug: "royal-reception",
    name: "Royal Reception",
    description:
      "Dark maroon invitation with gold script, couple portraits, love journey, and a choosable pre-wedding gallery.",
    categoryId: wedding._id,
    isActive: true,
    images: [
      { slot: "hero", url: hero.url, publicId: hero.publicId },
      { slot: "groom", url: groom.url, publicId: groom.publicId },
      { slot: "bride", url: bride.url, publicId: bride.publicId },
    ],
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
      footer: "© All rights reserved · Inviteo",
      envelopeTagline: "An invitation awaits",
      openHint: "Tap the seal to open",
      eventDateIso: "2026-12-25T11:00:00+05:30",
      countdownHeading: "The big day is almost here",
      countdownLiveLabel: "Alhamdulillah — we're married!",
      countdownLayout: "classic",
      ambianceEffect: "petals",
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
      appleMapsUrl: "https://maps.apple.com/?q=Grand%20Palace%20Auditorium%20Kozhikode",
      locationItems: [
        {
          label: "Nikah",
          title: "Grand Palace — Main Hall",
          address: "Grand Palace, Kozhikode, Kerala",
          mapsUrl: "https://www.google.com/maps/search/?api=1&query=Grand%20Palace%20Kozhikode",
          appleMapsUrl: "https://maps.apple.com/?q=Grand%20Palace%20Kozhikode",
        },
        {
          label: "Reception",
          title: "Grand Palace — Auditorium",
          address: "Grand Palace Auditorium, Kozhikode, Kerala",
          mapsUrl:
            "https://www.google.com/maps/search/?api=1&query=Grand%20Palace%20Auditorium%20Kozhikode",
          appleMapsUrl: "https://maps.apple.com/?q=Grand%20Palace%20Auditorium%20Kozhikode",
        },
        {
          label: "Walima",
          title: "Grand Palace — Banquet Lawn",
          address: "Grand Palace Grounds, Kozhikode, Kerala",
          mapsUrl: "https://www.google.com/maps/search/?api=1&query=Grand%20Palace%20Kozhikode%20Kerala",
          appleMapsUrl: "https://maps.apple.com/?q=Grand%20Palace%20Kozhikode%20Kerala",
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
  console.log(`Love story chapters seeded: ${loveStoryItems.length}`);
  console.log(`Gallery photos seeded: ${galleryItems.length} (layout: masonry)`);
});
