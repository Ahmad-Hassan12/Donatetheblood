import { API_BASE_URL } from "@/lib/backend";

export const dynamic = "force-dynamic";

/**
 * Returns the "who am I" payload for the current session.
 *
 * /api/v1/auth/profile only returns { donorId, email, role } — no name, phone
 * or avatar — which is why the Navbar kept showing "Login/Register" after a
 * successful login. Here we best-effort merge the full donor row (name/phone)
 * fetched from /api/v1/donors/:id. Admins/requesters have no donor row, so on
 * failure (or non-donor roles) the minimal profile is returned untouched and
 * the client falls back to that.
 */
export async function GET(request: Request) {
  if (!API_BASE_URL) {
    return Response.json(
      { error: "Backend not configured — set NEXT_PUBLIC_API_URL in .env/.env.local." },
      { status: 503 }
    );
  }

  const profile = await fetch(`${API_BASE_URL}/api/v1/auth/profile`, {
    headers: request.headers,
    cache: "no-store",
  });

  if (!profile.ok) {
    const errorBody = (await profile.json().catch(() => null)) as unknown;
    return Response.json(errorBody ?? { error: "Profile fetch failed." }, {
      status: profile.status,
    });
  }

  interface ProfilePayload {
    success?: boolean;
    message?: string;
    data?: Record<string, unknown>;
  }

  let body: ProfilePayload;
  try {
    body = ((await profile.json()) as ProfilePayload | null) ?? {};
  } catch {
    // Upstream returned 2xx without a JSON body — fall back to an empty
    // profile so the session never crashes the route.
    body = {};
  }
  const data: Record<string, unknown> = body?.data ?? {};

  // GET /auth/profile returns the donor row with `id` (not `donorId`).
  const donorId =
    typeof data.donorId === "string"
      ? data.donorId
      : typeof data.id === "string"
        ? data.id
        : null;
  if (donorId) {
    try {
      const donor = await fetch(
        `${API_BASE_URL}/api/v1/donors/${encodeURIComponent(donorId)}`,
        { headers: request.headers, cache: "no-store" }
      );
      if (donor.ok) {
        const donorBody = (await donor.json()) as {
          data?: Record<string, unknown>;
        };
        if (donorBody.data && typeof donorBody.data === "object") {
          const d = donorBody.data;
          data.id = donorId;
          data.donor = d;
          if (typeof d.fullName === "string") data.fullName = d.fullName;
          if (typeof d.phone === "string") data.phone = d.phone;
        }
      }
    } catch {
      // Non-fatal — fall back to the minimal profile shape.
    }
  }

  return Response.json({ ...body, data });
}