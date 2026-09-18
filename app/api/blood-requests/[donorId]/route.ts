import type { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend";

export const dynamic = "force-dynamic";

export async function POST(_req: NextRequest, ctx: RouteContext<"/api/blood-requests/[donorId]">) {
  const { donorId } = await ctx.params;
  return proxyToBackend(_req, `/api/v1/blood-requests/${encodeURIComponent(donorId)}`);
}