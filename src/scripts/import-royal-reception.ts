import path from "path";
import { connectDB } from "../config/db";
import { TEMPLATE_IMAGE_FOLDER, uploadImageFile } from "../config/cloudinary";
import { CategoryRepository } from "../repositories/category.repository";
import { TemplateRepository } from "../repositories/template.repository";
import mongoose from "mongoose";

const categoryRepository = new CategoryRepository();
const templateRepository = new TemplateRepository();

async function importRoyalReception(): Promise<void> {
  await connectDB();

  let wedding = await categoryRepository.findWedding();

  if (!wedding) {
    wedding = await categoryRepository.create({
      name: "Wedding",
      description: "Wedding invitation templates",
      isActive: true,
    });
    console.log(`Created Wedding category: ${wedding._id}`);
  } else {
    console.log(`Using Wedding category: ${wedding.name} (${wedding._id})`);
  }

  const imagePath = path.resolve(
    __dirname,
    "../../../client/public/templates/royal-reception/couple.png"
  );

  const uploaded = await uploadImageFile(imagePath, TEMPLATE_IMAGE_FOLDER);
  console.log(`Uploaded couple image: ${uploaded.url}`);

  const template = await templateRepository.upsertBySlug({
    slug: "royal-reception",
    name: "Royal Reception",
    description: "Dark maroon invitation with gold script and a couple portrait.",
    categoryId: wedding._id,
    isActive: true,
    images: [{ slot: "hero", url: uploaded.url, publicId: uploaded.publicId }],
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
      dayNote: "Alhamdulillah, the day is here",
      venueLabel: "Venue",
      venueName: "Grand Palace",
      venueHall: "Auditorium",
      venueCity: "Kozhikode",
      mapsUrl: "https://www.google.com/maps/search/?api=1&query=Grand%20Palace%20Auditorium%20Kozhikode",
      hashtag: "#IbrahimWedsAisha",
      blessing: "May Allah bless this union and fill it with love, mercy and tranquility.",
      inviteLine: "Kindly grace the occasion with your presence and duas",
      footer: "© All rights reserved · Inviteo",
      shareText:
        "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\n\nYou're invited to the wedding reception of Ibrahim & Aisha\nHosted by the family of Mr. Abdul Rahman & Mrs. Amina\nFriday, 25 December 2026 · 11:00 AM\nGrand Palace — Auditorium, Kozhikode\n\nPlease join us with your duas 🤲",
    },
  });

  console.log(`Template ready: ${template.slug} -> category ${wedding.name}`);
  await mongoose.disconnect();
}

importRoyalReception().catch((error) => {
  console.error("Failed to import template:", error);
  process.exit(1);
});
