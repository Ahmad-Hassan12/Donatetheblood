/**
 * Shared token helpers, safe to import from both client components and
 * server route handlers (no window/document access, no side effects).
 */

export interface TokensPayload {
  accessToken?: string;
  refreshToken?: string;
}

/** Pulls { accessToken, refreshToken } out of a backend response body. */
export function extractTokens(body: unknown): TokensPayload {
  const data =
    body && typeof body === "object"
      ? (body as { data?: unknown } | Record<string, unknown>)
      : null;
  const d =
    data && "data" in data && data.data && typeof data.data === "object"
      ? (data.data as Record<string, unknown>)
      : (data as Record<string, unknown> | null);
  const pick = (keys: string[]): string | undefined => {
    if (!d) return undefined;
    for (const key of keys) {
      const v = d[key];
      if (typeof v === "string" && v.length > 0) return v;
    }
    return undefined;
  };
  return {
    accessToken: pick(["accessToken", "access_token", "token", "jwt"]),
    refreshToken: pick(["refreshToken", "refresh_token"]),
  };
}

/**
 * Removes refresh-token fields from a backend response body so the refresh
 * token never reaches browser JS. Mutates and returns the same object.
 */
export function stripRefreshToken(body: Record<string, unknown>): void {
  delete body.refreshToken;
  delete body.refresh_token;
  const data = body.data as Record<string, unknown> | undefined;
  if (data && typeof data === "object") {
    delete data.refreshToken;
    delete data.refresh_token;
  }
}