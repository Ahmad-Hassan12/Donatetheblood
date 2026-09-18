import type { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/donors/[id]">) {
  const { id } = await ctx.params;
  return proxyToBackend(_req, `/api/v1/donors/${encodeURIComponent(id)}`);
}