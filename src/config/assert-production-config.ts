import { allowedClientOrigins } from "../common/http/client-origins";
import { readSmtpMailConfig } from "./smtp-mail";

function requireSecret(name: string, minLength = 32): void {
  const value = process.env[name]?.trim() || "";
  if (!value || value.length < minLength) {
    throw new Error(`${name} must be set to a secret of at least ${minLength} characters in production.`);
  }
}

function requireEnv(name: string): void {
  if (!process.env[name]?.trim()) {
    throw new Error(`${name} must be set in production.`);
  }
}

function assertClientOrigins(): void {
  const origins = allowedClientOrigins();
  if (!origins.length) {
    throw new Error("CLIENT_ORIGINS (or CLIENT_ORIGIN) must be set in production.");
  }

  const onlyLoopback = origins.every((origin) => {
    try {
      const host = new URL(origin).hostname;
      return host === "localhost" || host === "127.0.0.1" || host === "[::1]";
    } catch {
      return true;
    }
  });

  if (onlyLoopback) {
    throw new Error(
      "CLIENT_ORIGINS must include your live frontend origin in production (not localhost-only)."
    );
  }
}

/** Fails fast in production when required secrets / integrations are missing. */
export function assertProductionConfig(): void {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  requireSecret("JWT_ACCESS_SECRET");
  requireSecret("JWT_REFRESH_SECRET");
  requireEnv("CLOUDINARY_CLOUD_NAME");
  requireEnv("CLOUDINARY_API_KEY");
  requireEnv("CLOUDINARY_API_SECRET");
  assertClientOrigins();

  if (!readSmtpMailConfig()) {
    throw new Error("SMTP_USER and SMTP_PASS must be set in production for transactional email.");
  }
}
