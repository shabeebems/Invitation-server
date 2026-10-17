import { BadRequestError } from "../errors";
import type { ITemplateContent } from "../../models/template.model";
import { clampTemplateContent, findContentLimitViolations } from "./content-limits";
import { EVENT_DATE_TOO_SOON_MESSAGE, isEventDateAllowed } from "./event-date";

/**
 * Reject oversized text / invalid *new* event dates, then return a clamped copy.
 * Pass `previous` on updates so an already-saved past date is not blocked when
 * uploading photos or editing unrelated fields.
 */
export function assertAndClampContent(
  content: Partial<ITemplateContent>,
  previous?: Partial<ITemplateContent> | null
): Partial<ITemplateContent> {
  const violations = findContentLimitViolations(content);

  if (violations.length) {
    const preview = violations.slice(0, 6).join(", ");
    const more = violations.length > 6 ? ` (+${violations.length - 6} more)` : "";
    throw new BadRequestError(`Some text fields are too long: ${preview}${more}`);
  }

  if (typeof content.eventDateIso === "string" && content.eventDateIso.trim()) {
    const unchanged = previous?.eventDateIso === content.eventDateIso;
    if (!unchanged && !isEventDateAllowed(content.eventDateIso)) {
      throw new BadRequestError(EVENT_DATE_TOO_SOON_MESSAGE);
    }
  }

  if (typeof content.eventEndIso === "string" && content.eventEndIso.trim()) {
    const unchanged = previous?.eventEndIso === content.eventEndIso;
    if (!unchanged && !isEventDateAllowed(content.eventEndIso)) {
      throw new BadRequestError(EVENT_DATE_TOO_SOON_MESSAGE);
    }
  }

  return clampTemplateContent(content);
}
