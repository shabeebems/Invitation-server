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

/** First allowed origin — used for email links when CLIENT_ORIGIN is unset. */
export function primaryClientOrigin(): string {
  return (allowedClientOrigins()[0] || "http://localhost:3000").replace(/\/+$/, "");
}
