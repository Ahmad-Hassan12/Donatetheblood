/**
 * Auth API surface. Public endpoints (login, register, logout) go through
 * `raw` so they never attach a token or enter the refresh loop; session reads
 * go through `apiClient` (auto-refresh on 401).
 *
 * On login/register the server parks the refresh token in an httpOnly cookie
 * and returns only the access token, which we keep in memory.
 */

import { ApiError, apiClient, raw } from "@/lib/api/client";
import { extractTokens } from "@/lib/api/tokens";
import { clearSession, setAccessToken } from "@/lib/api/token-store";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface DonorRegistration {
  fullName: string;
  phone: string;
  email: string;
  cnicNumber: string;
  password: string;
  bloodGroup: string;
  city: string;
  area: string;
  agreedToTermsAt: string;
}

export async function login(credentials: LoginCredentials): Promise<void> {
  const res = await raw.post("/api/auth/login", credentials);
  const tokens = extractTokens(res.data);
  if (!tokens.accessToken) {
    throw new ApiError(
      "Login succeeded but no session was returned. Please try again.",
      0
    );
  }
  setAccessToken(tokens.accessToken);
}

export async function register(payload: DonorRegistration): Promise<void> {
  // The backend stores a pending registration and emails a 6-digit OTP — it
  // does not create the account and does not issue tokens. The frontend then
  // verifies the OTP through /api/auth/verify-otp (proxied to the backend's
  // /api/v1/auth/verify-email) before any account exists.
  const res = await raw.post("/api/donors/register", payload);
  const body = res.data as { success?: boolean; message?: string } | undefined;
  if (body?.success === false) {
    throw new ApiError(body.message ?? "Registration failed.", 200);
  }
  const tokens = extractTokens(res.data);
  if (tokens.accessToken) setAccessToken(tokens.accessToken);
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

/** Confirms the OTP; on success the backend creates the real account. */
export async function verifyOtp(payload: VerifyOtpPayload): Promise<void> {
  // /api/auth/verify-otp proxies to the backend's /api/v1/auth/verify-email
  // (the /verify-otp backend route does not exist).
  const res = await raw.post("/api/auth/verify-otp", payload);
  const body = res.data as { success?: boolean; message?: string } | undefined;
  if (body?.success === false) {
    throw new ApiError(body.message ?? "Verification failed.", res.status);
  }
}

/** Requests a fresh OTP for an existing pending registration (60s cooldown). */
export async function resendOtp(email: string): Promise<void> {
  // /api/auth/resend-otp proxies to the backend's /api/v1/auth/resend-verification
  // (the /resend-otp backend route does not exist).
  const res = await raw.post("/api/auth/resend-otp", { email });
  const body = res.data as { success?: boolean; message?: string } | undefined;
  if (body?.success === false) {
    throw new ApiError(body.message ?? "Couldn't resend the code.", res.status);
  }
}

/**
 * Ends the session: notifies the backend (best-effort) and clears the local
 * access token + session flag. The route handler clears the httpOnly cookie.
 */
export async function logout(): Promise<void> {
  try {
    await raw.post("/api/auth/logout");
  } catch {
    // Best-effort — the local session is still cleared below.
  } finally {
    clearSession();
  }
}

/** In-memory session helper used by legacy consumers. Reads the current user. */
export async function getMe(): Promise<unknown> {
  const res = await apiClient.get("/api/me");
  return res.data;
}

export { refreshAccessToken as refreshSession } from "@/lib/api/client";