import { proxyLogout } from "@/lib/api/route-helpers";

export async function POST(request: Request) {
  return proxyLogout(request);
}