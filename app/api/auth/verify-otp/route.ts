import { proxyNonSessionIssuer } from "@/lib/api/route-helpers";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return proxyNonSessionIssuer(request, "/api/v1/auth/verify-email");
}