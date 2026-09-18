import { proxyToBackend } from "@/lib/backend";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return proxyToBackend(request, "/api/v1/auth/profile");
}

export async function PUT(request: Request) {
  return proxyToBackend(request, "/api/v1/auth/profile");
}
