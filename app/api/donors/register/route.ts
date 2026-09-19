import { proxyNonSessionIssuer } from "@/lib/api/route-helpers";

export const maxDuration = 60;

// Backend path is /api/v1/auth/register (frontend route is /api/donors/register).
// Registration must not log the donor in — tokens are stripped and no auth
// cookie is set; they sign in manually at /login after verifying their email.
export async function POST(request: Request) {
  return proxyNonSessionIssuer(request, "/api/v1/auth/register");
}