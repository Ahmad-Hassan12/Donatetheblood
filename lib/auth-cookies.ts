/**
 * Server-side auth cookie helpers. The refresh token is stored in an httpOnly,
 * SameSite=Lax cookie so browser JS can never read it; a small non-httpOnly
 * "session" flag (set/cleared in lockstep) tells the client when a silent
 * refresh is worth attempting.
 */

import "server-only";
import { type NextResponse } from "next/server";

export const REFRESH_COOKIE = "bb_refresh";
export const SESSION_COOKIE = "bb_session";

const SHARED = {
  path: "/",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
} as const;

export const REFRESH_COOKIE_OPTIONS = {
  ...SHARED,
  httpOnly: true,
  maxAge: 60 * 60 * 24 * 30, // 30 days, rotated on every refresh
} as const;

export const SESSION_COOKIE_OPTIONS = {
  ...SHARED,
  httpOnly: false,
  maxAge: 60 * 60 * 24 * 30,
} as const;

export function setAuthCookies(
  response: NextResponse,
  refreshToken: string
): NextResponse {
  response.cookies.set(REFRESH_COOKIE, refreshToken, REFRESH_COOKIE_OPTIONS);
  response.cookies.set(SESSION_COOKIE, "1", SESSION_COOKIE_OPTIONS);
  return response;
}

export function clearAuthCookies(response: NextResponse): NextResponse {
  response.cookies.delete(REFRESH_COOKIE);
  response.cookies.delete(SESSION_COOKIE);
  return response;
}

/** Reads the httpOnly refresh cookie out of a raw Cookie header. */
export function getRefreshToken(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    const name = part.slice(0, eq).trim();
    if (name === REFRESH_COOKIE) {
      return decodeURIComponent(part.slice(eq + 1).trim());
    }
  }
  return null;
}