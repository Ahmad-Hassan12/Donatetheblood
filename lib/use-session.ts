"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { apiClient, logout as apiLogout } from "@/lib/api";

export type SessionRole = "DONOR" | "ADMIN" | "REQUESTER";

export interface SessionUser {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  role: SessionRole;
}

/** Pulls a session user out of the backend profile payload, whatever nesting. */
export function unwrapUser(body: unknown): SessionUser | null {
  if (!body || typeof body !== "object") return null;
  const obj = body as Record<string, unknown>;
  const candidates: unknown[] = [];
  if (obj.data && typeof obj.data === "object") {
    candidates.push(obj.data);
    const d = obj.data as Record<string, unknown>;
    for (const key of ["user", "donor", "profile"]) {
      if (d[key] && typeof d[key] === "object") candidates.push(d[key]);
    }
  }
  for (const key of ["user", "donor", "profile"]) {
    if (obj[key] && typeof obj[key] === "object") candidates.push(obj[key]);
  }
  let userObj: Record<string, unknown> | null = null;
  for (const c of candidates) {
    const cObj = c as Record<string, unknown>;
    // The auth/profile endpoint returns { donorId, email, role } with no
    // name/fullName — accept it so logged-in users (and admins) still show up.
    if (
      typeof cObj.name === "string" ||
      typeof cObj.fullName === "string" ||
      typeof cObj.donorId === "string" ||
      typeof cObj.userId === "string"
    ) {
      userObj = cObj;
      break;
    }
  }
  if (!userObj) return null;
  const role =
    userObj.role === "USER" ? "DONOR" : ((userObj.role as SessionRole) ?? "DONOR");
  return {
    id: String(userObj.id ?? userObj.userId ?? userObj.donorId ?? ""),
    name: String(userObj.fullName ?? userObj.name ?? ""),
    phone: String(userObj.phone ?? ""),
    email:
      typeof userObj.email === "string" && userObj.email.length > 0
        ? userObj.email
        : null,
    role,
  };
}

export function useSession() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await apiClient.get("/api/me");
      setUser(res.status === 200 ? unwrapUser(res.data) : null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Re-fetch the session on mount and on every navigation (pathname change).
  // This keeps the navbar in sync after login/logout — local state
  // doesn't reset on navigation/refresh. A 401 transparently refreshes the
  // session from the httpOnly cookie once before the retry.
  useEffect(() => {
    let cancelled = false;
    apiClient
      .get("/api/me")
      .then(async (res) => {
        if (res.status === 200) {
          const u = unwrapUser(res.data);
          if (!cancelled) setUser(u);
        } else if (!cancelled) {
          setUser(null);
        }
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const logout = useCallback(async () => {
    await apiLogout().catch(() => {});
    setUser(null);
    setLoading(false);
    router.push("/");
    router.refresh();
  }, [router]);

  return { user, loading, refresh, logout };
}