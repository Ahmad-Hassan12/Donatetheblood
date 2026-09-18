import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");

const PROTECTED = [{ path: "/admin", adminOnly: true }];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const rule = PROTECTED.find(
    (r) => pathname === r.path || pathname.startsWith(`${r.path}/`)
  );
  if (!rule) return NextResponse.next();

  const redirectToLogin = () => {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  };

  if (!API_BASE_URL) return redirectToLogin();

  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/me`, {
      headers: { cookie: request.headers.get("cookie") ?? "" },
      cache: "no-store",
    });
    if (!res.ok) return redirectToLogin();

    const data = (await res.json()) as { user?: { role?: string } };
    if (rule.adminOnly && data.user?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  } catch {
    return redirectToLogin();
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
