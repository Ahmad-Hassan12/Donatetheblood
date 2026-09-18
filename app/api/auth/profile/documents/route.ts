import { proxyToBackend } from "@/lib/backend";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  return proxyToBackend(request, "/api/v1/auth/profile/documents");
}

export async function GET(request: Request) {
  return proxyToBackend(request, "/api/v1/auth/profile/documents");
}
