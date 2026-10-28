export function allowedClientOrigins(): string[] {
  const raw =
    process.env.CLIENT_ORIGINS ||
    process.env.CLIENT_ORIGIN ||
    "http://localhost:3000";

  return raw
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}
