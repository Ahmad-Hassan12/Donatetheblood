/**
 * @deprecated Auth moved to the axios layer in `lib/api/`. This module stays
 * only so legacy consumers (`lib/app-api.ts`, admin/session pages not yet
 * migrated) compile unchanged — new code should import from `@/lib/api`.
 *
 * Token model change: the access token now lives in JS memory
 * (`lib/api/token-store.ts`) and the refresh token was moved to an httpOnly
 * cookie set by the route handlers — it is never readable from JavaScript.
 */

import {
  clearSession,
  getAccessToken as readAccessToken,
  hasSessionFlag,
  setAccessToken as persistAccessToken,
} from "@/lib/api/token-store";
import { refreshSession as renewSession } from "@/lib/api/auth";
import { extractTokens } from "@/lib/api/tokens";

export function getAccessToken(): string | null {
  return readAccessToken();
}

/** @deprecated The refresh token lives in an httpOnly cookie, never in JS. */
export function getRefreshToken(): string | null {
  return null;
}

/** Stores the access token in memory; the refresh token becomes an httpOnly cookie server-side. */
export function setTokens(accessToken: string, refreshToken?: string): void {
  void refreshToken;
  persistAccessToken(accessToken);
}

export function clearTokens(): void {
  clearSession();
}

export { extractTokens };

export function refreshSession(): Promise<boolean> {
  return renewSession().then((token) => token !== null);
}

/**
 * fetch() that attaches the current Bearer token and transparently refreshes
 * + retries once on a 401 (refresh runs server-side via the httpOnly cookie).
 * Use `skipAuth` for public calls (login, register) that must not refresh.
 */
export async function authFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
  opts?: { skipAuth?: boolean }
): Promise<Response> {
  const token = getAccessToken();
  const buildHeaders = () => {
    const headers = new Headers(init?.headers);
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  };
  const cache = init?.cache ?? "no-store";

  const res = await fetch(input, { ...init, headers: buildHeaders(), cache });

  if (!opts?.skipAuth && (token || hasSessionFlag()) && res.status === 401) {
    const ok = await refreshSession();
    if (ok) {
      const fresh = getAccessToken();
      const headers = new Headers(init?.headers);
      if (fresh) headers.set("Authorization", `Bearer ${fresh}`);
      return fetch(input, { ...init, headers, cache });
    }
  }
  return res;
}