import { proxyTokenIssuer } from "@/lib/api/route-helpers";

export async function POST(request: Request) {
  return proxyTokenIssuer(request, "/api/v1/auth/login");
}