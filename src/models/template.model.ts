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

export interface ILoveStoryItem {
  icon: string;
  date: string;
  place: string;
  title: string;
  url: string;
  publicId: string;
}

export interface ILocationItem {
  label: string;
  title: string;
  address: string;
  mapsUrl: string;
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
  countdownLayout: string;
  heroLayout: string;
  ambianceEffect: string;
  programLayout: string;
  programEyebrow: string;
  programTitle: string;
  programIntro: string;
  programItems: IProgramItem[];
  galleryEyebrow: string;
  galleryTitle: string;
  galleryIntro: string;
  galleryLayout: string;
  galleryItems: IGalleryItem[];
  viewPhotoLabel: string;
  locationEyebrow: string;
  locationTitle: string;
  locationIntro: string;
  locationLayout: string;
  destinationLabel: string;
  addressFull: string;
  addressShort: string;
  googleMapsUrl: string;
  copyAddressLabel: string;
  hamdalah: string;
  closingBlessing: string;
  closingPresence: string;
  replayLabel: string;
  craftedBy: string;
  addToCalendarLabel: string;
  getDirectionsLabel: string;
  calendarModalTitle: string;
  calendarModalDesc: string;
  googleCalendarLabel: string;
  icsCalendarLabel: string;
  dressCode: string;
  rsvpNote: string;
  storyTitle: string;
  storyText: string;
  meetCoupleTitle: string;
  meetCoupleIntro: string;
  meetCoupleLayout: string;
  groomLabel: string;
  groomBio: string;
  groomDetail: string;
  brideLabel: string;
  brideBio: string;
  brideDetail: string;
  loveStoryTitle: string;
  loveStoryLayout: string;
  loveStoryItems: ILoveStoryItem[];
  locationItems: ILocationItem[];
  /** Venue amenity rows (Velvet Heritage and similar). */
  amenityOneLabel: string;
  amenityOneDetail: string;
  amenityTwoLabel: string;
  amenityTwoDetail: string;
  amenityThreeLabel: string;
  amenityThreeDetail: string;
  /** Footer layout id (e.g. Velvet Heritage signature). */
  footerLayout: string;
  /** Story section layout (e.g. Botanical Script arch narrative). */
  storyLayout: string;
  /** Quote banner layout. */
  quoteLayout: string;
  /** Which template sections render (ids from template-sections catalog). */
  enabledSections: string[];
}

export type TemplateContentTextKey = Exclude<
  keyof ITemplateContent,
  "programItems" | "galleryItems" | "loveStoryItems" | "locationItems" | "enabledSections"
>;
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
  "ambianceEffect",
];

export const WEDDING_ONLY_CONTENT_KEYS: TemplateContentTextKey[] = [
  "hostLabel",
  "introLine",
  "groomName",
  "brideName",
  "brideParentsLabel",
  "brideParents",
  "presenceLine",
  "venueLabel",
  "venueHall",
  "mapsUrl",
  "hashtag",
  "inviteLine",
  "footer",
  "storyTitle",
  "storyText",
  "dressCode",
  "rsvpNote",
  "meetCoupleTitle",
  "meetCoupleIntro",
  "meetCoupleLayout",
  "groomLabel",
  "groomBio",
  "groomDetail",
  "brideLabel",
  "brideBio",
  "brideDetail",
  "loveStoryTitle",
  "loveStoryLayout",
  "galleryEyebrow",
  "galleryTitle",
  "galleryIntro",
  "galleryLayout",
  "viewPhotoLabel",
  "amenityOneLabel",
  "amenityOneDetail",
  "amenityTwoLabel",
  "amenityTwoDetail",
  "amenityThreeLabel",
  "amenityThreeDetail",
  "footerLayout",
  "storyLayout",
  "quoteLayout",
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
  "countdownLayout",
  "heroLayout",
  "programLayout",
  "programEyebrow",
  "programTitle",
  "programIntro",
  "locationEyebrow",
  "locationTitle",
  "locationIntro",
  "locationLayout",
  "destinationLabel",
  "addressFull",
  "addressShort",
  "googleMapsUrl",
  "copyAddressLabel",
  "hamdalah",
  "closingBlessing",
  "closingPresence",
  "replayLabel",
  "craftedBy",
  "addToCalendarLabel",
  "calendarModalTitle",
  "calendarModalDesc",
  "googleCalendarLabel",
  "icsCalendarLabel",
];

export const WEDDING_SHARED_FROM_HOUSE: TemplateContentTextKey[] = [
  "envelopeTagline",
  "skipLabel",
  "openHint",
  "eventDateIso",
  "eventEndIso",
  "countdownHeading",
  "countdownLiveLabel",
  "countdownLayout",
  "heroLayout",
  "programLayout",
  "programEyebrow",
  "programTitle",
  "programIntro",
  "locationEyebrow",
  "locationTitle",
  "locationIntro",
  "locationLayout",
  "destinationLabel",
  "addressFull",
  "addressShort",
  "googleMapsUrl",
  "copyAddressLabel",
  "addToCalendarLabel",
  "getDirectionsLabel",
  "calendarModalTitle",
  "calendarModalDesc",
  "googleCalendarLabel",
  "icsCalendarLabel",
  "closingBlessing",
  "closingPresence",
  "replayLabel",
  "craftedBy",
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
      ? [...WEDDING_ONLY_CONTENT_KEYS]
      : family === "wedding"
        ? [...HOUSEWARMING_ONLY_CONTENT_KEYS.filter((key) => !WEDDING_SHARED_FROM_HOUSE.includes(key))]
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

  if (Array.isArray(source.programItems)) {
    next.programItems = source.programItems;
  }

  if (family !== "housewarming" && Array.isArray(source.galleryItems)) {
    next.galleryItems = source.galleryItems;
  }

  if (Array.isArray(source.loveStoryItems)) {
    next.loveStoryItems = source.loveStoryItems;
  }

  if (Array.isArray(source.locationItems)) {
    next.locationItems = source.locationItems;
  }

  if (Array.isArray(source.enabledSections)) {
    next.enabledSections = source.enabledSections.filter(
      (id): id is string => typeof id === "string" && id.trim().length > 0
    );
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

const loveStoryItemSchema = new Schema<ILoveStoryItem>(
  {
    icon: { type: String, default: "" },
    date: { type: String, default: "" },
    place: { type: String, default: "" },
    title: { type: String, default: "" },
    url: { type: String, default: "" },
    publicId: { type: String, default: "" },
  },
  { _id: false }
);

const locationItemSchema = new Schema<ILocationItem>(
  {
    label: { type: String, default: "" },
    title: { type: String, default: "" },
    address: { type: String, default: "" },
    mapsUrl: { type: String, default: "" },
  },
  { _id: false }
);

export const templateContentSchema = new Schema<ITemplateContent>(
  {
    ...contentFields,
    programItems: { type: [programItemSchema] },
    galleryItems: { type: [galleryItemSchema] },
    loveStoryItems: { type: [loveStoryItemSchema] },
    locationItems: { type: [locationItemSchema] },
    enabledSections: { type: [String], default: undefined },
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
