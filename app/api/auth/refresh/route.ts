import { proxyRefresh } from "@/lib/api/route-helpers";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return proxyRefresh(request);
}