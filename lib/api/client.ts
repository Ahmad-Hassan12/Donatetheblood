/**
 * Axios HTTP client with the auth plumbing all endpoints share:
 *  - request interceptor attaches `Authorization: Bearer <accessToken>`
 *    (access token lives in memory — see lib/api/token-store.ts)
 *  - on a 401 the client runs a single-flight /api/auth/refresh — the refresh
 *    token is read by the server from an httpOnly cookie — and retries the
 *    request exactly once
 *  - every failure is normalized into an ApiError
 *
 * Public endpoints (login, register, refresh, logout) go through the bare
 * `raw` instance so they never attach a token or enter the refresh loop.
 */

import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import { extractTokens } from "@/lib/api/tokens";
import {
  clearSession,
  getAccessToken,
  hasSessionFlag,
  setAccessToken,
} from "@/lib/api/token-store";

interface PrivateRequestConfig {
  skipAuth?: boolean;
  _retry?: boolean;
}

type RequestConfigWithPrivate = InternalAxiosRequestConfig & PrivateRequestConfig;

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

export class ApiError extends Error {
  status: number;
  issues?: Record<string, string>;

  constructor(message: string, status: number, issues?: Record<string, string>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.issues = issues;
  }
}

function parseErrorBody(
  body: unknown,
  status: number
): { message: string; issues?: Record<string, string> } {
  if (body && typeof body === "object") {
    const b = body as Record<string, unknown>;
    const msg =
      typeof b.message === "string"
        ? b.message
        : typeof b.error === "string"
          ? b.error
          : `Request failed (${status})`;
    let issues: Record<string, string> | undefined;
    if (b.issues && typeof b.issues === "object") {
      issues = b.issues as Record<string, string>;
    }
    if (Array.isArray(b.errors)) {
      const fieldIssues: Record<string, string> = {};
      for (const item of b.errors) {
        if (item && typeof item === "object") {
          const e = item as { field?: unknown; message?: unknown };
          if (typeof e.field === "string" && typeof e.message === "string") {
            fieldIssues[e.field] = e.message;
          }
        }
      }
      if (Object.keys(fieldIssues).length > 0) {
        issues = { ...(issues ?? {}), ...fieldIssues };
      }
    }
    return { message: msg, issues };
  }
  return { message: `Request failed (${status})` };
}

export function normalizeError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? 0;
    if (!error.response) {
      return new ApiError(
        "Cannot reach the server. Please check your connection and try again.",
        0
      );
    }
    const { message, issues } = parseErrorBody(error.response.data, status);
    return new ApiError(message, status, issues);
  }
  return new ApiError("Unexpected error. Please try again.", 0);
}

// ---------------------------------------------------------------------------
// Bare client for public endpoints (no auth attach, no refresh loop)
// ---------------------------------------------------------------------------

export const raw = axios.create({
  timeout: 30_000,
  headers: { "Content-Type": "application/json" },
});

raw.interceptors.response.use((res) => res, (error) => {
  throw normalizeError(error);
});

// ---------------------------------------------------------------------------
// Authenticated client
// ---------------------------------------------------------------------------

export const apiClient = axios.create({ timeout: 30_000 });

apiClient.interceptors.request.use((config) => {
  const privateConfig = config as RequestConfigWithPrivate;
  if (!privateConfig.skipAuth) {
    const token = getAccessToken();
    if (token) config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const axiosErr = error as AxiosError<unknown>;
    const config = axiosErr.config as RequestConfigWithPrivate | undefined;
    const status = axiosErr.response?.status;

    if (
      config &&
      !config.skipAuth &&
      !config._retry &&
      status === 401 &&
      hasSessionFlag()
    ) {
      config._retry = true;
      const fresh = await refreshAccessToken();
      if (fresh) return apiClient(config);
    }
    throw normalizeError(error);
  }
);

// ---------------------------------------------------------------------------
// Single-flight session refresh
// ---------------------------------------------------------------------------

let refreshInFlight: Promise<string | null> | null = null;

async function performRefresh(): Promise<string | null> {
  try {
    const res = await raw.post("/api/auth/refresh");
    const tokens = extractTokens(res.data);
    if (!tokens.accessToken) {
      clearSession();
      return null;
    }
    setAccessToken(tokens.accessToken);
    return tokens.accessToken;
  } catch {
    clearSession();
    return null;
  }
}

/**
 * Exchanges the httpOnly refresh cookie for a fresh access token. Concurrent
 * callers share the same in-flight request.
 */
export async function refreshAccessToken(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = performRefresh().then((ok) => {
    refreshInFlight = null;
    return ok;
  });
  return refreshInFlight;
}