/**
 * Client-side token store.
 *
 * The access token lives only in this module's memory — never in storage a
 * script can read (localStorage/sessionStorage are XSS-visible). The refresh
 * token sits in an httpOnly cookie that browser JS cannot touch and is set by
 * the auth route handlers. On a hard reload the memory is empty, so the axios
 * interceptor silently refreshes from that cookie and retries the request.
 */

const SESSION_FLAG_COOKIE = "bb_session";

let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

/** Clears the in-memory access token AND the non-httpOnly session flag. */
export function clearSession(): void {
  accessToken = null;
  clearSessionFlag();
}

/**
 * Whether the server told us a session exists (httpOnly refresh cookie is
 * present). The client can't read that cookie, so this flag — set and cleared
 * by the auth route handlers in lockstep — tells the 401 interceptor when a
 * silent refresh is worth attempting (avoids refresh noise for anonymous
 * visitors).
 */
export function hasSessionFlag(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie
    .split(";")
    .some((c) => c.trim().startsWith(`${SESSION_FLAG_COOKIE}=`));
}

export function clearSessionFlag(): void {
  if (typeof document === "undefined") return;
  const secure =
    typeof location !== "undefined" && location.protocol === "https:"
      ? "; Secure"
      : "";
  document.cookie = `${SESSION_FLAG_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
}