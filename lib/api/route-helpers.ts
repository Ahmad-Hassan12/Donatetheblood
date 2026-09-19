/**
 * Server helpers for the auth route handlers. Each proxies to the Node
 * backend, moves the refresh token into an httpOnly cookie, and returns a
 * body that never exposes the refresh token to browser JS.
 */

import "server-only";
import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/backend";
import { extractTokens, stripRefreshToken } from "@/lib/api/tokens";
import {
  clearAuthCookies,
  getRefreshToken,
  setAuthCookies,
} from "@/lib/auth-cookies";

const BACKEND_UNSET_MSG =
  "Backend not configured — set NEXT_PUBLIC_API_URL in .env/.env.local.";
const BACKEND_DOWN_MSG = "Backend is unreachable. Please try again later.";

type JsonBody =
  | Record<string, unknown>
  | Record<string, unknown>[]
  | null;

async function readBody(res: Response): Promise<JsonBody> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as JsonBody;
  } catch {
    return null;
  }
}

function cloneBody(parsed: JsonBody): JsonBody {
  if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
    return { ...(parsed as Record<string, unknown>) };
  }
  return parsed;
}

function jsonError(message: string, status: number): NextResponse {
  return NextResponse.json({ success: false, message }, { status });
}

/**
 * Proxies a token-issuing POST (login / register) to the backend, parks the
 * refresh token in an httpOnly cookie, and forwards the response body with
 * every refresh-token field stripped out.
 */
export async function proxyTokenIssuer(
  request: Request,
  backendPath: string
): Promise<Response> {
  if (!API_BASE_URL) return jsonError(BACKEND_UNSET_MSG, 503);

  let body: string | null = null;
  try {
    body = await request.text();
  } catch {
    // no body
  }

  let upstream: Response;
  try {
    upstream = await fetch(new URL(backendPath, API_BASE_URL), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      cache: "no-store",
    });
  } catch {
    return jsonError(BACKEND_DOWN_MSG, 502);
  }

  const parsed = await readBody(upstream);
  const bodyOut = cloneBody(parsed);
  const tokens = extractTokens(parsed);
  if (bodyOut && typeof bodyOut === "object" && !Array.isArray(bodyOut)) {
    stripRefreshToken(bodyOut as Record<string, unknown>);
  }

  const response = NextResponse.json(bodyOut, { status: upstream.status });
  if (upstream.ok && tokens.refreshToken) {
    setAuthCookies(response, tokens.refreshToken);
  } else if (upstream.ok) {
    clearAuthCookies(response);
  }
  return response;
}

/**
 * Proxies a POST that must never create a session (registration, email OTP
 * verification). The backend may return access/refresh tokens in its body, but
 * no auth cookie is set and every token field is stripped so the browser never
 * receives login credentials — signing in stays exclusive to /auth/login.
 */
export async function proxyNonSessionIssuer(
  request: Request,
  backendPath: string
): Promise<Response> {
  if (!API_BASE_URL) return jsonError(BACKEND_UNSET_MSG, 503);

  let body: string | null = null;
  try {
    body = await request.text();
  } catch {
    // no body
  }

  let upstream: Response;
  try {
    upstream = await fetch(new URL(backendPath, API_BASE_URL), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      cache: "no-store",
    });
  } catch {
    return jsonError(BACKEND_DOWN_MSG, 502);
  }

  const parsed = await readBody(upstream);
  const bodyOut = cloneBody(parsed);
  if (bodyOut && typeof bodyOut === "object" && !Array.isArray(bodyOut)) {
    const root = bodyOut as Record<string, unknown>;
    const data = root.data as Record<string, unknown> | undefined;
    stripRefreshToken(root);
    for (const key of ["accessToken", "access_token", "token", "jwt"]) {
      delete root[key];
      if (data && typeof data === "object") delete data[key];
    }
  }

  const response = NextResponse.json(bodyOut, { status: upstream.status });
  return response;
}

/**
 * Refreshes the session using the httpOnly refresh cookie, rotates to a new
 * cookie, and returns the fresh access token to the client.
 */
export async function proxyRefresh(request: Request): Promise<Response> {
  if (!API_BASE_URL) return jsonError(BACKEND_UNSET_MSG, 503);

  const refresh = getRefreshToken(request.headers.get("cookie"));
  if (!refresh) return jsonError("No active session.", 401);

  let upstream: Response;
  try {
    upstream = await fetch(new URL("/api/v1/auth/refresh", API_BASE_URL), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: refresh }),
      cache: "no-store",
    });
  } catch {
    return jsonError(BACKEND_DOWN_MSG, 502);
  }

  const parsed = await readBody(upstream);
  const bodyOut = cloneBody(parsed);
  const tokens = extractTokens(parsed);
  if (bodyOut && typeof bodyOut === "object" && !Array.isArray(bodyOut)) {
    stripRefreshToken(bodyOut as Record<string, unknown>);
  }

  const response = NextResponse.json(bodyOut, { status: upstream.status });
  if (upstream.ok && tokens.refreshToken) {
    setAuthCookies(response, tokens.refreshToken);
  } else {
    clearAuthCookies(response);
  }
  return response;
}

/**
 * Logs out: best-effort notifies the backend with the refresh token, then
 * clears both auth cookies.
 */
export async function proxyLogout(request: Request): Promise<Response> {
  const refresh = getRefreshToken(request.headers.get("cookie"));

  if (API_BASE_URL && refresh) {
    try {
      await fetch(new URL("/api/v1/auth/logout", API_BASE_URL), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: refresh }),
        cache: "no-store",
      });
    } catch {
      // Best-effort — the browser session is cleared regardless of whether the
      // backend accepted the logout request.
    }
  }

  const response = NextResponse.json({ success: true });
  clearAuthCookies(response);
  return response;
}