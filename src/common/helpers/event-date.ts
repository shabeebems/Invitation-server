/** Event date rules — keep in sync with client/src/lib/event-date.ts */

export const EVENT_DATE_TOO_SOON_MESSAGE =
  "Event date must be after today. The earliest you can choose is tomorrow.";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function toLocalDateKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function earliestEventDateKey(now = new Date()) {
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return toLocalDateKey(tomorrow);
}

/** True when the chosen calendar day is tomorrow or later. */
export function isEventDateAllowed(value: string, now = new Date()) {
  if (!value) {
    return false;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return toLocalDateKey(date) >= earliestEventDateKey(now);
}
