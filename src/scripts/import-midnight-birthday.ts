import path from "path";
import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { TEMPLATE_IMAGE_FOLDER, uploadImageFile } from "../config/cloudinary";
import CategoryRepository from "../repositories/implementations/category-repository";
import TemplateRepository from "../repositories/implementations/template-repository";
import ThemeRepository from "../repositories/implementations/theme-repository";

const categoryRepository = new CategoryRepository();
const templateRepository = new TemplateRepository();
const themeRepository = new ThemeRepository();

async function importMidnightBirthday(): Promise<void> {
  await connectDB();

  let birthday = await categoryRepository.findBirthday();

  if (!birthday) {
    birthday = await categoryRepository.create({
      name: "Birthday",
      description: "Birthday party invitation templates",
      isActive: true,
    });
    console.log(`Created Birthday category: ${birthday._id}`);
  } else {
    console.log(`Using Birthday category: ${birthday.name} (${birthday._id})`);
  }

  const imagePath = path.resolve(
    __dirname,
    "../../../client/public/templates/midnight-birthday/hero.jpg"
  );

  const uploaded = await uploadImageFile(imagePath, TEMPLATE_IMAGE_FOLDER);
  console.log(`Uploaded hero image: ${uploaded.url}`);

  const template = await templateRepository.upsertBySlug({
    slug: "midnight-birthday",
    name: "Midnight Birthday",
    description:
      "Premium midnight champagne birthday invitation with portrait hero, age badge, and celebration details.",
    categoryId: birthday._id,
    isActive: true,
    images: [{ slot: "hero", url: uploaded.url, publicId: uploaded.publicId }],
    content: {
      partyTitle: "You're Invited",
      celebrantName: "Aanya",
      ageLabel: "Turning Seven",
      hostLabel: "Hosted with love by",
      hostNames: "Rahul & Meera",
      introLine: "Join us for an evening of laughter, cake, and celebration",
      weekday: "Saturday",
      day: "18",
      monthYear: "April 2026",
      time: "At 06:00 PM",
      eventDateIso: "2026-04-18T18:00:00+05:30",
      venueLabel: "Venue",
      venueName: "Skyline Terrace",
      venueHall: "Rooftop Lounge",
      venueCity: "Bengaluru",
      addressFull: "Skyline Terrace, 42 MG Road, Bengaluru",
      mapsUrl: "https://www.google.com/maps/search/?api=1&query=Skyline%20Terrace%20MG%20Road%20Bengaluru",
      googleMapsUrl:
        "https://www.google.com/maps/search/?api=1&query=Skyline%20Terrace%20MG%20Road%20Bengaluru",
      dressCode: "Festive chic",
      presenceLine: "An evening of cake, music, and warm company",
      inviteLine: "Come ready to celebrate, dance, and make a wish",
      blessing: "May this year bring you wonder, courage, and endless joy.",
      hashtag: "#AanyaTurns7",
      footer: "© All rights reserved · Inviteo",
      shareText:
        "You're invited to Aanya's birthday celebration\nHosted by Rahul & Meera\nSaturday, 18 April 2026 · 06:00 PM\nSkyline Terrace — Rooftop Lounge, Bengaluru\n\nJoin us for cake, laughter, and celebration",
    },
  });

  const champagne = await themeRepository.findOrCreate({
    title: "Midnight Champagne",
    templateId: template._id,
  });
  const ember = await themeRepository.findOrCreate({
    title: "Coral Ember",
    templateId: template._id,
  });

  await templateRepository.updateSelectedTheme(String(template._id), String(champagne._id));

  console.log(`Template ready: ${template.slug} -> ${birthday.name}`);
  console.log(`CHAMPAGNE_THEME_ID=${champagne._id}`);
  console.log(`EMBER_THEME_ID=${ember._id}`);

  await mongoose.disconnect();
}

importMidnightBirthday().catch((error) => {
  console.error("Failed to import birthday template:", error);
  process.exit(1);
});
