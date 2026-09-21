export function parseBoolean(value: unknown, fallback = true): boolean {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  if (typeof value === "boolean") {
    return value;
  }

  const normalized = String(value).toLowerCase();

  if (normalized === "true" || normalized === "1" || normalized === "on") {
    return true;
  }

  if (normalized === "false" || normalized === "0" || normalized === "off") {
    return false;
  }

  return fallback;
}
