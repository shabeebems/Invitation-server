import type {
  IGalleryItem,
  ILocationItem,
  ILoveStoryItem,
  IProgramItem,
  ITemplateContent,
  TemplateContentTextKey,
} from "../../models/template.model";
import { TEMPLATE_CONTENT_KEYS } from "../../models/template.model";

/** Default cap when a field is not listed below. */
export const DEFAULT_CONTENT_MAX = 200;

/**
 * Max characters per invitation text field.
 * Keep in sync with client/src/lib/content-limits.ts
 */
export const CONTENT_FIELD_MAX: Partial<Record<TemplateContentTextKey, number>> = {
  bismillah: 120,
  hostLabel: 120,
  hostNames: 80,
  introLine: 160,
  groomName: 40,
  brideName: 40,
  brideParentsLabel: 40,
  brideParents: 80,
  presenceLine: 220,
  weekday: 24,
  day: 8,
  monthYear: 40,
  time: 40,
  venueLabel: 40,
  venueName: 80,
  venueHall: 80,
  venueCity: 80,
  mapsUrl: 500,
  hashtag: 48,
  blessing: 400,
  inviteLine: 220,
  footer: 120,
  shareText: 1200,
  envelopeTagline: 80,
  skipLabel: 40,
  openHint: 80,
  bismillahTranslation: 120,
  mashallahBadge: 60,
  headlinePrefix: 80,
  familyLine: 80,
  houseName: 80,
  eventDateIso: 48,
  eventEndIso: 48,
  countdownHeading: 80,
  countdownLiveLabel: 80,
  countdownLayout: 32,
  heroLayout: 32,
  ambianceEffect: 32,
  programLayout: 32,
  programEyebrow: 40,
  programTitle: 80,
  programIntro: 280,
  galleryEyebrow: 40,
  galleryTitle: 80,
  galleryIntro: 280,
  galleryLayout: 32,
  viewPhotoLabel: 40,
  locationEyebrow: 40,
  locationTitle: 80,
  locationIntro: 280,
  locationLayout: 32,
  destinationLabel: 40,
  addressFull: 200,
  addressShort: 80,
  googleMapsUrl: 500,
  copyAddressLabel: 40,
  hamdalah: 80,
  closingBlessing: 400,
  closingPresence: 120,
  replayLabel: 40,
  craftedBy: 80,
  addToCalendarLabel: 40,
  getDirectionsLabel: 40,
  calendarModalTitle: 80,
  calendarModalDesc: 200,
  googleCalendarLabel: 40,
  icsCalendarLabel: 40,
  dressCode: 80,
  rsvpNote: 200,
  storyTitle: 80,
  storyText: 600,
  meetCoupleTitle: 80,
  meetCoupleIntro: 220,
  meetCoupleLayout: 32,
  groomLabel: 40,
  groomBio: 320,
  groomDetail: 120,
  brideLabel: 40,
  brideBio: 320,
  brideDetail: 120,
  loveStoryTitle: 80,
  loveStoryLayout: 32,
};

export const PROGRAM_ITEM_MAX = {
  time: 40,
  title: 80,
  description: 280,
} as const;

export const GALLERY_ITEM_MAX = {
  eyebrow: 40,
  title: 80,
  caption: 200,
  url: 500,
  publicId: 200,
} as const;

export const LOVE_STORY_ITEM_MAX = {
  icon: 40,
  date: 40,
  place: 80,
  title: 80,
  url: 500,
  publicId: 200,
} as const;

export const LOCATION_ITEM_MAX = {
  label: 40,
  title: 80,
  address: 200,
  mapsUrl: 500,
} as const;

export const MAX_PROGRAM_ITEMS = 16;
export const MAX_GALLERY_ITEMS = 20;
export const MAX_LOVE_STORY_ITEMS = 15;
export const MAX_LOCATION_ITEMS = 5;

export function maxForContentField(key: string): number {
  return CONTENT_FIELD_MAX[key as TemplateContentTextKey] ?? DEFAULT_CONTENT_MAX;
}

export function clampText(value: string, max: number): string {
  if (value.length <= max) {
    return value;
  }
  return value.slice(0, max);
}

function pushViolation(violations: string[], label: string, length: number, max: number) {
  if (length > max) {
    violations.push(`${label} (${length}/${max})`);
  }
}

export function findContentLimitViolations(content: Partial<ITemplateContent>): string[] {
  const violations: string[] = [];

  for (const key of TEMPLATE_CONTENT_KEYS) {
    const value = content[key];
    if (typeof value === "string") {
      pushViolation(violations, key, value.length, maxForContentField(key));
    }
  }

  if (Array.isArray(content.programItems)) {
    if (content.programItems.length > MAX_PROGRAM_ITEMS) {
      violations.push(`programItems count (${content.programItems.length}/${MAX_PROGRAM_ITEMS})`);
    }
    content.programItems.forEach((item, index) => {
      pushViolation(violations, `programItems[${index}].time`, item.time.length, PROGRAM_ITEM_MAX.time);
      pushViolation(violations, `programItems[${index}].title`, item.title.length, PROGRAM_ITEM_MAX.title);
      pushViolation(
        violations,
        `programItems[${index}].description`,
        item.description.length,
        PROGRAM_ITEM_MAX.description
      );
    });
  }

  if (Array.isArray(content.galleryItems)) {
    if (content.galleryItems.length > MAX_GALLERY_ITEMS) {
      violations.push(`galleryItems count (${content.galleryItems.length}/${MAX_GALLERY_ITEMS})`);
    }
    content.galleryItems.forEach((item, index) => {
      pushViolation(violations, `galleryItems[${index}].eyebrow`, item.eyebrow.length, GALLERY_ITEM_MAX.eyebrow);
      pushViolation(violations, `galleryItems[${index}].title`, item.title.length, GALLERY_ITEM_MAX.title);
      pushViolation(violations, `galleryItems[${index}].caption`, item.caption.length, GALLERY_ITEM_MAX.caption);
      pushViolation(violations, `galleryItems[${index}].url`, item.url.length, GALLERY_ITEM_MAX.url);
    });
  }

  if (Array.isArray(content.loveStoryItems)) {
    if (content.loveStoryItems.length > MAX_LOVE_STORY_ITEMS) {
      violations.push(`loveStoryItems count (${content.loveStoryItems.length}/${MAX_LOVE_STORY_ITEMS})`);
    }
    content.loveStoryItems.forEach((item, index) => {
      pushViolation(violations, `loveStoryItems[${index}].title`, item.title.length, LOVE_STORY_ITEM_MAX.title);
      pushViolation(violations, `loveStoryItems[${index}].date`, item.date.length, LOVE_STORY_ITEM_MAX.date);
      pushViolation(violations, `loveStoryItems[${index}].place`, item.place.length, LOVE_STORY_ITEM_MAX.place);
      if (item.url) {
        pushViolation(violations, `loveStoryItems[${index}].url`, item.url.length, LOVE_STORY_ITEM_MAX.url);
      }
    });
  }

  if (Array.isArray(content.locationItems)) {
    if (content.locationItems.length > MAX_LOCATION_ITEMS) {
      violations.push(`locationItems count (${content.locationItems.length}/${MAX_LOCATION_ITEMS})`);
    }
    content.locationItems.forEach((item, index) => {
      pushViolation(violations, `locationItems[${index}].label`, item.label.length, LOCATION_ITEM_MAX.label);
      pushViolation(violations, `locationItems[${index}].title`, item.title.length, LOCATION_ITEM_MAX.title);
      pushViolation(violations, `locationItems[${index}].address`, item.address.length, LOCATION_ITEM_MAX.address);
      pushViolation(violations, `locationItems[${index}].mapsUrl`, item.mapsUrl.length, LOCATION_ITEM_MAX.mapsUrl);
    });
  }

  return violations;
}

export function clampTemplateContent(content: Partial<ITemplateContent>): Partial<ITemplateContent> {
  const next: Partial<ITemplateContent> = { ...content };

  for (const key of TEMPLATE_CONTENT_KEYS) {
    const value = next[key];
    if (typeof value === "string") {
      next[key] = clampText(value, maxForContentField(key));
    }
  }

  if (Array.isArray(next.programItems)) {
    next.programItems = next.programItems.slice(0, MAX_PROGRAM_ITEMS).map(
      (item): IProgramItem => ({
        time: clampText(item.time || "", PROGRAM_ITEM_MAX.time),
        title: clampText(item.title || "", PROGRAM_ITEM_MAX.title),
        description: clampText(item.description || "", PROGRAM_ITEM_MAX.description),
      })
    );
  }

  if (Array.isArray(next.galleryItems)) {
    next.galleryItems = next.galleryItems.slice(0, MAX_GALLERY_ITEMS).map(
      (item): IGalleryItem => ({
        eyebrow: clampText(item.eyebrow || "", GALLERY_ITEM_MAX.eyebrow),
        title: clampText(item.title || "", GALLERY_ITEM_MAX.title),
        caption: clampText(item.caption || "", GALLERY_ITEM_MAX.caption),
        url: clampText(item.url || "", GALLERY_ITEM_MAX.url),
        publicId: clampText(item.publicId || "", GALLERY_ITEM_MAX.publicId),
      })
    );
  }

  if (Array.isArray(next.loveStoryItems)) {
    next.loveStoryItems = next.loveStoryItems.slice(0, MAX_LOVE_STORY_ITEMS).map(
      (item): ILoveStoryItem => ({
        icon: clampText(item.icon || "", LOVE_STORY_ITEM_MAX.icon),
        date: clampText(item.date || "", LOVE_STORY_ITEM_MAX.date),
        place: clampText(item.place || "", LOVE_STORY_ITEM_MAX.place),
        title: clampText(item.title || "", LOVE_STORY_ITEM_MAX.title),
        url: clampText(item.url || "", LOVE_STORY_ITEM_MAX.url),
        publicId: clampText(item.publicId || "", LOVE_STORY_ITEM_MAX.publicId),
      })
    );
  }

  if (Array.isArray(next.locationItems)) {
    next.locationItems = next.locationItems.slice(0, MAX_LOCATION_ITEMS).map(
      (item): ILocationItem => ({
        label: clampText(item.label || "", LOCATION_ITEM_MAX.label),
        title: clampText(item.title || "", LOCATION_ITEM_MAX.title),
        address: clampText(item.address || "", LOCATION_ITEM_MAX.address),
        mapsUrl: clampText(item.mapsUrl || "", LOCATION_ITEM_MAX.mapsUrl),
      })
    );
  }

  if (Array.isArray(next.enabledSections)) {
    next.enabledSections = next.enabledSections
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 32);
  }

  return next;
}
