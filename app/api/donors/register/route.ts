import { proxyTokenIssuer } from "@/lib/api/route-helpers";

export const maxDuration = 60;

// Backend path is /api/v1/auth/register (frontend route is /api/donors/register).
export async function POST(request: Request) {
  return proxyTokenIssuer(request, "/api/v1/auth/register");
}