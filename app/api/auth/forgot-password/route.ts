import { proxyToBackend } from "@/lib/backend";

export async function POST(request: Request) {
  return proxyToBackend(request, "/api/v1/auth/forgot-password");
}