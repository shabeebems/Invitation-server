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
      place: "A monsoon evening at a friend’s terrace in Kochi — one umbrella, two strangers.",
    },
    {
      title: "First Chat",
      date: "19 Apr 2021",
      place: "A late-night call that lasted until the birds woke up.",
    },
    {
      title: "First Date",
      date: "7 Sep 2022",
      place: "Fort Kochi cafés, shared filter coffee, and a walk by the Chinese nets.",
    },
    {
      title: "Engagement",
      date: "12 Dec 2026",
      place: "At home with both families — a quiet yes that felt like forever.",
    },
    {
      title: "Our Wedding",
      date: "20 Feb 2027",
      place: "Lakeview Heritage Hall, Kochi — where our next chapter begins.",
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
        "Two souls, one journey,\nand a lifetime of love ahead.\nWe would be honoured to have you with us\nas we begin this chapter in Kochi.",
      presenceLine: "With love from our families",
      weekday: "Saturday",
      day: "20",
      monthYear: "February 2027",
      time: "At 11:00 AM",
      venueLabel: "Venue",
      venueName: "Lakeview Heritage Hall",
      venueCity: "Marine Drive, Kochi",
      addressFull: "Lakeview Heritage Hall, Marine Drive, Kochi, Kerala 682001",
      mapsUrl: "https://maps.google.com/?q=Lakeview+Heritage+Hall+Kochi",
      googleMapsUrl: "https://maps.google.com/?q=Lakeview+Heritage+Hall+Kochi",
      getDirectionsLabel: "Get Directions →",
      locationEyebrow: "Venue & Location",
      locationTitle: "Venue & Location",
      locationLayout: "atlas",
      amenityOneLabel: "Stay",
      amenityOneDetail: "Guest rooms held at nearby waterfront hotels",
      amenityTwoLabel: "Parking",
      amenityTwoDetail: "Complimentary on-site parking for families",
      amenityThreeLabel: "Getting there",
      amenityThreeDetail: "Fifteen minutes from Ernakulam Junction",
      envelopeTagline: "A Journey of Two Hearts",
      openHint: "Together Forever",
      skipLabel: "Enter the invitation",
      eventDateIso: "2027-02-20T11:00:00+05:30",
      countdownHeading: "Until we meet at the hall",
      countdownLiveLabel: "We're married!",
      countdownLayout: "gilded-rings",
      heroLayout: "arch",
      ambianceEffect: "petals",
      enabledSections: ["hero", "countdown", "gallery", "story", "location", "footer"],
      galleryEyebrow: "Our Gallery",
      galleryTitle: "Moments we will keep forever",
      galleryIntro: "Henna, golden hour, and the quiet in-between.",
      galleryLayout: "mosaic",
      galleryItems,
      loveStoryTitle: "Our Journey",
      storyTitle: "How we found each other",
      meetCoupleIntro: "From a Kochi terrace to forever — our story in five chapters.",
      loveStoryLayout: "rail",
      loveStoryItems,
      closingPresence: "Thank You",
      closingBlessing:
        "Your presence will make our day complete.\nWe cannot wait to celebrate with you.",
      footerLayout: "signature",
      footer: "© All rights reserved · Save the Kath",
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
