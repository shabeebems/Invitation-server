export type TemplateSectionFamily =
  | "royal"
  | "house"
  | "velvet"
  | "palace"
  | "botanical"
  | "ruby"
  | "aurelia"
  | "cream";

export type SectionDef = {
  id: string;
  label: string;
  required?: boolean;
};

export const ROYAL_SECTIONS: SectionDef[] = [
  { id: "hero", label: "Hero", required: true },
  { id: "countdown", label: "Countdown" },
  { id: "couple", label: "Meet Couple" },
  { id: "story", label: "Love Story" },
  { id: "gallery", label: "Gallery" },
  { id: "location", label: "Location" },
  { id: "footer", label: "Footer" },
];

export const HOUSE_SECTIONS: SectionDef[] = [
  { id: "hero", label: "Hero", required: true },
  { id: "countdown", label: "Countdown" },
  { id: "schedule", label: "Schedule" },
  { id: "location", label: "Location" },
  { id: "footer", label: "Footer" },
];

export const VELVET_SECTIONS: SectionDef[] = [
  { id: "hero", label: "Hero", required: true },
  { id: "countdown", label: "Countdown" },
  { id: "gallery", label: "Gallery" },
  { id: "story", label: "Timeline" },
  { id: "location", label: "Venue" },
  { id: "footer", label: "Footer" },
];

export const PALACE_SECTIONS: SectionDef[] = [
  { id: "hero", label: "Hero", required: true },
  { id: "countdown", label: "Countdown" },
  { id: "gallery", label: "Gallery" },
  { id: "story", label: "Timeline" },
  { id: "location", label: "Venue" },
  { id: "footer", label: "Footer" },
];

export const BOTANICAL_SECTIONS: SectionDef[] = [
  { id: "hero", label: "Hero", required: true },
  { id: "story", label: "Our Story" },
  { id: "events", label: "Events" },
  { id: "quote", label: "Quote" },
  { id: "gallery", label: "Gallery" },
  { id: "itinerary", label: "Itinerary" },
  { id: "family", label: "Family" },
  { id: "location", label: "Location" },
  { id: "footer", label: "Footer" },
];

export const RUBY_SECTIONS: SectionDef[] = [
  { id: "hero", label: "Hero", required: true },
  { id: "blessings", label: "Blessings" },
  { id: "countdown", label: "Countdown" },
  { id: "events", label: "Celebrations" },
  { id: "location", label: "Venue" },
  { id: "rsvp", label: "RSVP" },
  { id: "footer", label: "Footer" },
];

export const AURELIA_SECTIONS: SectionDef[] = [
  { id: "hero", label: "Hero", required: true },
  { id: "couple", label: "The Couple" },
  { id: "gallery", label: "Story Frames" },
  { id: "story", label: "Journey" },
  { id: "events", label: "Celebration" },
  { id: "location", label: "Venue" },
  { id: "countdown", label: "Countdown" },
  { id: "dress", label: "Dress Code" },
  { id: "rsvp", label: "RSVP" },
  { id: "final", label: "Closing" },
  { id: "footer", label: "Footer" },
];

export const CREAM_SECTIONS: SectionDef[] = [
  { id: "hero", label: "Hero", required: true },
  { id: "welcome", label: "Welcome" },
  { id: "couple", label: "The Couple" },
  { id: "story", label: "Our Story" },
  { id: "gallery", label: "Gallery" },
  { id: "events", label: "Events" },
  { id: "location", label: "Venue" },
  { id: "countdown", label: "Countdown" },
  { id: "dress", label: "Dress & Travel" },
  { id: "faq", label: "FAQ" },
  { id: "rsvp", label: "RSVP" },
  { id: "final", label: "Closing" },
  { id: "footer", label: "Footer" },
];

export const SECTION_CATALOGS: Record<TemplateSectionFamily, SectionDef[]> = {
  royal: ROYAL_SECTIONS,
  house: HOUSE_SECTIONS,
  velvet: VELVET_SECTIONS,
  palace: PALACE_SECTIONS,
  botanical: BOTANICAL_SECTIONS,
  ruby: RUBY_SECTIONS,
  aurelia: AURELIA_SECTIONS,
  cream: CREAM_SECTIONS,
};

export function sectionsForFamily(family: TemplateSectionFamily): SectionDef[] {
  return SECTION_CATALOGS[family];
}

export function defaultEnabledSections(family: TemplateSectionFamily): string[] {
  return sectionsForFamily(family).map((section) => section.id);
}

export function resolveEnabledSections(
  family: TemplateSectionFamily,
  saved: string[] | undefined | null
): string[] {
  const catalog = sectionsForFamily(family);
  const allowed = new Set(catalog.map((section) => section.id));

  if (!Array.isArray(saved)) {
    return defaultEnabledSections(family);
  }

  const remapped =
    family === "botanical" ? saved.map((id) => (id === "travel" ? "location" : id)) : saved;
  const enabled = new Set(remapped.filter((id) => allowed.has(id)));
  for (const section of catalog) {
    if (section.required) {
      enabled.add(section.id);
    }
  }

  return catalog.filter((section) => enabled.has(section.id)).map((section) => section.id);
}

export function familyFromTemplateSlug(slug: string): TemplateSectionFamily {
  const value = slug || "";
  if (/parambil-house|house/i.test(value)) return "house";
  if (/velvet-heritage|velvet/i.test(value)) return "velvet";
  if (/palace-parchment|palace/i.test(value)) return "palace";
  if (/botanical-script|botanical/i.test(value)) return "botanical";
  if (/royal-ruby|ruby/i.test(value)) return "ruby";
  if (/aurelia-nocturne|aurelia/i.test(value)) return "aurelia";
  if (/cream-editorial|cream/i.test(value)) return "cream";
  return "royal";
}

export function clampEnabledSections(
  family: TemplateSectionFamily,
  saved: string[] | undefined | null
): string[] {
  return resolveEnabledSections(family, saved);
}
