import { BadRequestError } from "../errors";
import type { ITemplateContent } from "../../models/template.model";
import { clampTemplateContent, findContentLimitViolations } from "./content-limits";
import { EVENT_DATE_TOO_SOON_MESSAGE, isEventDateAllowed } from "./event-date";

/** Reject oversized text / invalid event dates, then return a clamped copy for safe persistence. */
export function assertAndClampContent(content: Partial<ITemplateContent>): Partial<ITemplateContent> {
  const violations = findContentLimitViolations(content);

  if (violations.length) {
    const preview = violations.slice(0, 6).join(", ");
    const more = violations.length > 6 ? ` (+${violations.length - 6} more)` : "";
    throw new BadRequestError(`Some text fields are too long: ${preview}${more}`);
  }

  if (typeof content.eventDateIso === "string" && content.eventDateIso.trim()) {
    if (!isEventDateAllowed(content.eventDateIso)) {
      throw new BadRequestError(EVENT_DATE_TOO_SOON_MESSAGE);
    }
  }

  if (typeof content.eventEndIso === "string" && content.eventEndIso.trim()) {
    if (!isEventDateAllowed(content.eventEndIso)) {
      throw new BadRequestError(EVENT_DATE_TOO_SOON_MESSAGE);
    }
  }

  return clampTemplateContent(content);
}
