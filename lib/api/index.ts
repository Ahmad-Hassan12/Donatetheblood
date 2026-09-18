/**
 * Public API surface for the axios layer. New code imports from `@/lib/api`
 * instead of the legacy `@/lib/auth-client` / `@/lib/app-api` modules.
 */

export * from "@/lib/api/tokens";
export * from "@/lib/api/token-store";

export {
  ApiError,
  apiClient,
  normalizeError,
  refreshAccessToken,
} from "@/lib/api/client";

export {
  login,
  logout,
  register,
  verifyOtp,
  resendOtp,
  refreshSession,
  getMe,
} from "@/lib/api/auth";
export type { LoginCredentials, DonorRegistration } from "@/lib/api/auth";