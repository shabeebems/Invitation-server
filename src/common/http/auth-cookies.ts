import { Response } from "express";

const ACCESS_COOKIE = "accessToken";
const REFRESH_COOKIE = "refreshToken";
const ACCESS_MAX_AGE = 15 * 60 * 1000;
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

function baseOptions(maxAge?: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    ...(maxAge === undefined ? {} : { maxAge }),
  };
}

export function readCookie(header: string | undefined, name: string): string | undefined {
  if (!header) {
    return undefined;
  }

  const parts = header.split(";").map((part) => part.trim());
  const match = parts.find((part) => part.startsWith(`${name}=`));

  if (!match) {
    return undefined;
  }

  return decodeURIComponent(match.slice(name.length + 1));
}

export function setAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
  res.cookie(ACCESS_COOKIE, accessToken, baseOptions(ACCESS_MAX_AGE));
  res.cookie(REFRESH_COOKIE, refreshToken, baseOptions(REFRESH_MAX_AGE));
}

export function clearAuthCookies(res: Response): void {
  const options = baseOptions();
  res.clearCookie(ACCESS_COOKIE, options);
  res.clearCookie(REFRESH_COOKIE, options);
}

export function accessCookie(header: string | undefined): string | undefined {
  return readCookie(header, ACCESS_COOKIE);
}

export function refreshCookie(header: string | undefined): string | undefined {
  return readCookie(header, REFRESH_COOKIE);
}
