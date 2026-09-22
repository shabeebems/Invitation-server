import { Schema, model, Document, Types } from "mongoose";
import "./theme.model";

export interface IProgramItem {
  time: string;
  title: string;
  description: string;
}

export interface IGalleryItem {
  eyebrow: string;
  title: string;
  caption: string;
  url: string;
  publicId: string;
}

export interface ITemplateContent {
  bismillah: string;
  hostLabel: string;
  hostNames: string;
  introLine: string;
  groomName: string;
  brideName: string;
  brideParentsLabel: string;
  brideParents: string;
  presenceLine: string;
  weekday: string;
  day: string;
  monthYear: string;
  time: string;
  dayNote: string;
  venueLabel: string;
  venueName: string;
  venueHall: string;
  venueCity: string;
  mapsUrl: string;
  hashtag: string;
  blessing: string;
  inviteLine: string;
  footer: string;
  shareText: string;
  envelopeTagline: string;
  skipLabel: string;
  openHint: string;
  bismillahTranslation: string;
  mashallahBadge: string;
  headlinePrefix: string;
  familyLine: string;
  houseName: string;
  eventDateIso: string;
  eventEndIso: string;
  countdownHeading: string;
  countdownLiveLabel: string;
  programEyebrow: string;
  programTitle: string;
  programIntro: string;
  programItems: IProgramItem[];
  galleryEyebrow: string;
  galleryTitle: string;
  galleryIntro: string;
  galleryItems: IGalleryItem[];
  viewPhotoLabel: string;
  locationEyebrow: string;
  locationTitle: string;
  locationIntro: string;
  destinationLabel: string;
  addressFull: string;
  addressShort: string;
  googleMapsUrl: string;
  appleMapsUrl: string;
  copyAddressLabel: string;
  openGoogleLabel: string;
  openAppleLabel: string;
  hamdalah: string;
  closingBlessing: string;
  closingPresence: string;
  replayLabel: string;
  craftedBy: string;
  navCelebration: string;
  navProgram: string;
  navTour: string;
  navLocation: string;
  addToCalendarLabel: string;
  getDirectionsLabel: string;
  calendarModalTitle: string;
  calendarModalDesc: string;
  googleCalendarLabel: string;
  icsCalendarLabel: string;
}

export type TemplateContentTextKey = Exclude<keyof ITemplateContent, "programItems" | "galleryItems">;
export type TemplateContentFamily = "wedding" | "housewarming" | "shared";

export const SHARED_CONTENT_KEYS: TemplateContentTextKey[] = [
  "bismillah",
  "hostNames",
  "weekday",
  "day",
  "monthYear",
  "time",
  "venueName",
  "venueCity",
  "blessing",
  "shareText",
];

export const WEDDING_ONLY_CONTENT_KEYS: TemplateContentTextKey[] = [
  "hostLabel",
  "introLine",
  "groomName",
  "brideName",
  "brideParentsLabel",
  "brideParents",
  "presenceLine",
  "dayNote",
  "venueLabel",
  "venueHall",
  "mapsUrl",
  "hashtag",
  "inviteLine",
  "footer",
];

export const HOUSEWARMING_ONLY_CONTENT_KEYS: TemplateContentTextKey[] = [
  "envelopeTagline",
  "skipLabel",
  "openHint",
  "bismillahTranslation",
  "mashallahBadge",
  "headlinePrefix",
  "familyLine",
  "houseName",
  "eventDateIso",
  "eventEndIso",
  "countdownHeading",
  "countdownLiveLabel",
  "programEyebrow",
  "programTitle",
  "programIntro",
  "galleryEyebrow",
  "galleryTitle",
  "galleryIntro",
  "viewPhotoLabel",
  "locationEyebrow",
  "locationTitle",
  "locationIntro",
  "destinationLabel",
  "addressFull",
  "addressShort",
  "googleMapsUrl",
  "appleMapsUrl",
  "copyAddressLabel",
  "openGoogleLabel",
  "openAppleLabel",
  "hamdalah",
  "closingBlessing",
  "closingPresence",
  "replayLabel",
  "craftedBy",
  "navCelebration",
  "navProgram",
  "navTour",
  "navLocation",
  "addToCalendarLabel",
  "getDirectionsLabel",
  "calendarModalTitle",
  "calendarModalDesc",
  "googleCalendarLabel",
  "icsCalendarLabel",
];

export const TEMPLATE_CONTENT_KEYS: TemplateContentTextKey[] = [
  ...SHARED_CONTENT_KEYS,
  ...WEDDING_ONLY_CONTENT_KEYS,
  ...HOUSEWARMING_ONLY_CONTENT_KEYS,
];

export function contentFamilyFromCategory(name: string): TemplateContentFamily {
  if (/house\s*warm/i.test(name)) {
    return "housewarming";
  }

  if (/wedding/i.test(name)) {
    return "wedding";
  }

  return "shared";
}

export function compactTemplateContent(
  content: Partial<ITemplateContent> | undefined,
  family: TemplateContentFamily = "shared"
): Partial<ITemplateContent> {
  const source = content || {};
  const omit = new Set<string>(
    family === "housewarming"
      ? WEDDING_ONLY_CONTENT_KEYS
      : family === "wedding"
        ? HOUSEWARMING_ONLY_CONTENT_KEYS
        : []
  );
  const next: Partial<ITemplateContent> = {};

  for (const key of TEMPLATE_CONTENT_KEYS) {
    if (omit.has(key)) {
      continue;
    }

    const value = source[key];
    if (typeof value === "string" && value !== "") {
      next[key] = value;
    }
  }

  if (family !== "wedding") {
    if (Array.isArray(source.programItems)) {
      next.programItems = source.programItems;
    }

    if (Array.isArray(source.galleryItems)) {
      next.galleryItems = source.galleryItems;
    }
  }

  return next;
}

export interface ITemplateImage {
  slot: string;
  url: string;
  publicId: string;
}

export function findTemplateImage(images: ITemplateImage[] | undefined, slot: string) {
  return images?.find((image) => image.slot === slot);
}

export function upsertTemplateImage(
  images: ITemplateImage[] | undefined,
  slot: string,
  url: string,
  publicId: string
): ITemplateImage[] {
  const next = (images || []).map((image) => ({
    slot: image.slot,
    url: image.url,
    publicId: image.publicId,
  }));
  const item = { slot, url, publicId };
  const index = next.findIndex((image) => image.slot === slot);

  if (index >= 0) {
    next[index] = item;
  } else {
    next.push(item);
  }

  return next;
}

export interface ITemplate extends Document {
  slug: string;
  name: string;
  description: string;
  categoryId: Types.ObjectId;
  selectedThemeId?: Types.ObjectId;
  isActive: boolean;
  images: ITemplateImage[];
  content: ITemplateContent;
  createdAt: Date;
  updatedAt: Date;
}

const contentFields = TEMPLATE_CONTENT_KEYS.reduce(
  (fields, key) => {
    fields[key] = { type: String };
    return fields;
  },
  {} as Record<TemplateContentTextKey, { type: StringConstructor }>
);

const programItemSchema = new Schema<IProgramItem>(
  {
    time: { type: String, default: "" },
    title: { type: String, default: "" },
    description: { type: String, default: "" },
  },
  { _id: false }
);

const galleryItemSchema = new Schema<IGalleryItem>(
  {
    eyebrow: { type: String, default: "" },
    title: { type: String, default: "" },
    caption: { type: String, default: "" },
    url: { type: String, default: "" },
    publicId: { type: String, default: "" },
  },
  { _id: false }
);

export const templateContentSchema = new Schema<ITemplateContent>(
  {
    ...contentFields,
    programItems: { type: [programItemSchema] },
    galleryItems: { type: [galleryItemSchema] },
  },
  { _id: false }
);

export const templateImageSchema = new Schema<ITemplateImage>(
  {
    slot: { type: String, required: true, trim: true },
    url: { type: String, default: "" },
    publicId: { type: String, default: "" },
  },
  { _id: false }
);

const templateSchema = new Schema<ITemplate>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    selectedThemeId: {
      type: Schema.Types.ObjectId,
      ref: "Theme",
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    images: {
      type: [templateImageSchema],
      default: [],
    },
    content: {
      type: templateContentSchema,
      default: {},
    },
  },
  { timestamps: true }
);

export const TemplateModel = model<ITemplate>("Template", templateSchema, "templates");
