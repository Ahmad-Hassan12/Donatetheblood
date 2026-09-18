import { proxyToBackend } from "@/lib/backend";

export const dynamic = "force-dynamic";

// Backend path is /api/v1/auth/reset-password (frontend route is /api/auth/change-password).
export async function POST(request: Request) {
  return proxyToBackend(request, "/api/v1/auth/reset-password");
}