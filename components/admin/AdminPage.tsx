"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { relativeTime } from "@/lib/search-utils";
import type { BloodGroup } from "@/lib/search-types";
import type { Urgency } from "@/lib/schemas";
import {
  BadgeCheck,
  Droplets,
  Hourglass,
  Loader2,
  LogOut,
  Search,
  ShieldCheck,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { authFetch } from "@/lib/auth-client";
import { unwrapUser } from "@/lib/use-session";
import type { SessionUser } from "@/lib/use-session";

type Tab = "overview" | "pending" | "donors" | "requests";

interface Stats {
  totalDonors: number;
  pendingVerifications: number;
  openRequests: number;
  verifiedDonors: number;
}

interface AdminDonor {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  bloodGroup: BloodGroup;
  city: string;
  area: string;
  lastDonationDate: string | null;
  registrationDate: string | null;
  verified?: boolean;
  available?: boolean;
}

interface AdminRequest {
  id: string;
  bloodGroup: BloodGroup;
  city: string;
  area: string;
  hospital: string | null;
  units: number;
  urgency: Urgency;
  contact: string;
  status: "open" | "fulfilled" | "cancelled";
  notifiedCount: number;
  createdAt: string;
}

const TABS: { key: Tab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "pending", label: "Pending verifications" },
  { key: "donors", label: "All donors" },
  { key: "requests", label: "Requests" },
];

const STATUS_STYLE: Record<AdminRequest["status"], string> = {
  open: "bg-blood/10 text-blood-deep",
  fulfilled: "bg-green-500/10 text-green-700",
  cancelled: "bg-smoke text-mute",
};

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl bg-ink p-6 text-white">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">
          {label}
        </p>
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10">
          {icon}
        </span>
      </div>
      <p className="mt-4 font-display text-4xl font-bold">{value}</p>
    </div>
  );
}

function TableWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-3xl border border-fog bg-white shadow-[0_16px_50px_-32px_rgba(10,10,10,0.35)]">
      <table className="w-full min-w-[640px] text-left text-sm">{children}</table>
    </div>
  );
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      className={cn(
        "border-b border-fog bg-smoke/70 px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-mute",
        className
      )}
    >
      {children}
    </th>
  );
}

function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <td className={cn("border-b border-fog/70 px-4 py-3.5 align-middle", className)}>
      {children}
    </td>
  );
}

function dateCell(value: string | null) {
  return value ? (
    <span className="text-xs text-mute">{value.slice(0, 10)}</span>
  ) : (
    <span className="text-xs text-mute/60">—</span>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [forbidden, setForbidden] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");

  const [stats, setStats] = useState<Stats | null>(null);
  const [pending, setPending] = useState<AdminDonor[] | null>(null);
  const [donors, setDonors] = useState<AdminDonor[] | null>(null);
  const [requests, setRequests] = useState<AdminRequest[] | null>(null);
  const [q, setQ] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const refreshStats = useCallback(async () => {
    const res = await authFetch("/api/admin/stats", { cache: "no-store" });
    if (res.ok) setStats(((await res.json()) as { stats: Stats }).stats);
  }, []);

  const refreshPending = useCallback(async () => {
    const res = await authFetch("/api/admin/donors/pending", { cache: "no-store" });
    if (res.ok) setPending(((await res.json()) as { donors: AdminDonor[] }).donors);
  }, []);

  const refreshDonors = useCallback(async (query: string) => {
    const res = await authFetch(`/api/admin/donors?q=${encodeURIComponent(query)}`, {
      cache: "no-store",
    });
    if (res.ok) setDonors(((await res.json()) as { donors: AdminDonor[] }).donors);
  }, []);

  const refreshRequests = useCallback(async () => {
    const res = await authFetch("/api/admin/requests", { cache: "no-store" });
    if (res.ok) setRequests(((await res.json()) as { requests: AdminRequest[] }).requests);
  }, []);

  useEffect(() => {
    authFetch("/api/me", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) {
          router.replace("/login?next=%2Fadmin");
          return;
        }
        const u = unwrapUser(await res.json());
        if (!u || u.role !== "ADMIN") {
          setForbidden(true);
          return;
        }
        setUser(u);
      })
      .catch(() => router.replace("/login?next=%2Fadmin"));
  }, [router]);

  useEffect(() => {
    if (!user) return;
    const delay = tab === "donors" ? 300 : 0;
    const t = setTimeout(() => {
      if (tab === "overview") void refreshStats();
      else if (tab === "donors") void refreshDonors(q);
      else if (tab === "pending") void refreshPending();
      else if (tab === "requests") void refreshRequests();
    }, delay);
    return () => clearTimeout(t);
  }, [tab, user, q, refreshStats, refreshDonors, refreshPending, refreshRequests]);

  const filteredDonors = useMemo(() => {
    if (!donors) return null;
    const term = q.trim().toLowerCase();
    if (!term) return donors;
    return donors.filter((d) =>
      [d.name, d.phone, d.bloodGroup, d.city, d.area].join(" ").toLowerCase().includes(term)
    );
  }, [donors, q]);

  async function act(id: string, kind: "verify" | "unverify" | "remove") {
    setBusyId(id);
    try {
      if (kind === "remove") {
        await authFetch(`/api/admin/donors/${id}/remove`, {
          method: "POST",
          cache: "no-store",
        });
      } else {
        await authFetch(`/api/admin/donors/${id}/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ verified: kind === "verify" }),
          cache: "no-store",
        });
      }
      await refreshStats();
      if (tab === "pending") await refreshPending();
      if (tab === "donors") await refreshDonors(q);
    } finally {
      setBusyId(null);
    }
  }

  if (forbidden || !user) {
    return (
      <main data-bg="light" className="min-h-svh bg-white pb-24 pt-32">
        <div className="mx-auto max-w-lg px-6 text-center">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blood/10">
            <ShieldCheck size={26} className="text-blood" />
          </span>
          <h1 className="mt-6 font-display text-3xl font-bold tracking-tight text-ink">
            Admin access only
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-mute">
            This area is restricted to platform admins. If you think this is a
            mistake, log in with an admin account.
          </p>
          <Link
            href="/login?next=%2Fadmin"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-blood px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-blood-deep"
          >
            Log in as admin
          </Link>
        </div>
      </main>
    );
  }

  const loadingBlock = (
    <div className="flex h-56 items-center justify-center">
      <Loader2 size={22} className="animate-spin text-mute" />
    </div>
  );

  return (
    <main data-bg="light" className="min-h-svh bg-white pb-24 pt-28 md:pt-32">
      <div className="mx-auto max-w-6xl px-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blood">
              Admin console
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink md:text-4xl">
              Keep the network trustworthy
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-3.5 py-2 text-xs font-semibold text-ink">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-ink text-[10px] font-bold text-white">
                {user.name
                  .split(" ")
                  .slice(0, 2)
                  .map((s) => s[0])
                  .join("")
                  .toUpperCase()}
              </span>
              {user.name}
            </span>
            <button
              type="button"
              onClick={async () => {
                await authFetch("/api/auth/logout", { method: "POST", cache: "no-store" });
                router.push("/");
                router.refresh();
              }}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 text-mute transition-colors hover:border-blood/50 hover:text-blood"
              aria-label="Log out"
            >
              <LogOut size={15} />
            </button>
          </div>
        </header>

        <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="Admin sections">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                tab === t.key
                  ? "bg-ink text-white"
                  : "border border-ink/15 bg-white text-ink/70 hover:border-blood/50 hover:text-blood"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-8">
          {tab === "overview" && (
            <>
              {stats ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard label="Total donors" value={stats.totalDonors} icon={<Users size={16} className="text-blood" />} />
                  <StatCard label="Pending verifications" value={stats.pendingVerifications} icon={<Hourglass size={16} className="text-blood" />} />
                  <StatCard label="Open requests" value={stats.openRequests} icon={<Droplets size={16} className="text-blood" />} />
                  <StatCard label="Verified donors" value={stats.verifiedDonors} icon={<BadgeCheck size={16} className="text-blood" />} />
                </div>
              ) : (
                loadingBlock
              )}
            </>
          )}

          {tab === "pending" && (
            <div className="space-y-4">
              {pending === null ? (
                loadingBlock
              ) : pending.length === 0 ? (
                <div className="rounded-3xl border border-fog bg-white p-12 text-center text-sm text-mute">
                  All donors verified — nothing pending. Nice work.
                </div>
              ) : (
                <TableWrap>
                  <thead>
                    <tr>
                      <Th>Donor</Th>
                      <Th>Group</Th>
                      <Th>City / area</Th>
                      <Th>Registered</Th>
                      <Th className="text-right">Actions</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {pending.map((d) => (
                      <tr key={d.id} className="hover:bg-smoke/40">
                        <Td>
                          <p className="font-semibold text-ink">{d.name}</p>
                          <p className="text-xs text-mute">{d.phone}</p>
                        </Td>
                        <Td>
                          <span className="inline-flex h-8 w-11 items-center justify-center rounded-lg bg-blood font-display text-sm font-bold text-white">
                            {d.bloodGroup}
                          </span>
                        </Td>
                        <Td>
                          <p className="text-ink">{d.area}</p>
                          <p className="text-xs text-mute">{d.city}</p>
                        </Td>
                        <Td>{dateCell(d.registrationDate)}</Td>
                        <Td>
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              disabled={busyId === d.id}
                              onClick={() => void act(d.id, "verify")}
                              className="inline-flex items-center gap-1.5 rounded-full bg-blood px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blood-deep disabled:opacity-60"
                            >
                              {busyId === d.id ? <Loader2 size={13} className="animate-spin" /> : <BadgeCheck size={13} />}
                              Verify
                            </button>
                            <button
                              type="button"
                              disabled={busyId === d.id}
                              onClick={() => void act(d.id, "remove")}
                              className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-3.5 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-blood hover:text-blood disabled:opacity-60"
                              aria-label={`Remove ${d.name}`}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </TableWrap>
              )}
            </div>
          )}

          {tab === "donors" && (
            <div className="space-y-4">
              <label className="relative block max-w-md">
                <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-mute" />
                <input
                  type="search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search by name, phone, group, city…"
                  className="h-11 w-full rounded-full border border-ink/15 bg-white pl-10 pr-4 text-sm text-ink placeholder:text-mute/70 focus:border-blood focus:outline-none focus:ring-2 focus:ring-blood/15"
                />
              </label>
              {filteredDonors === null ? (
                loadingBlock
              ) : (
                <TableWrap>
                  <thead>
                    <tr>
                      <Th>Donor</Th>
                      <Th>Group</Th>
                      <Th>Location</Th>
                      <Th>Registered</Th>
                      <Th>Status</Th>
                      <Th className="text-right">Actions</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDonors.map((d) => (
                      <tr key={d.id} className="hover:bg-smoke/40">
                        <Td>
                          <p className="font-semibold text-ink">{d.name}</p>
                          <p className="text-xs text-mute">{d.phone}</p>
                        </Td>
                        <Td>
                          <span className="inline-flex h-8 w-11 items-center justify-center rounded-lg bg-blood font-display text-sm font-bold text-white">
                            {d.bloodGroup}
                          </span>
                        </Td>
                        <Td>
                          <p className="text-ink">{d.area}</p>
                          <p className="text-xs text-mute">{d.city}</p>
                        </Td>
                        <Td>{dateCell(d.registrationDate)}</Td>
                        <Td>
                          <div className="flex flex-wrap gap-1.5">
                            <span
                              className={cn(
                                "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                                d.verified
                                  ? "bg-green-500/10 text-green-700"
                                  : "bg-amber-500/10 text-amber-700"
                              )}
                            >
                              {d.verified ? "Verified" : "Pending"}
                            </span>
                            <span
                              className={cn(
                                "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                                d.available
                                  ? "bg-blood/10 text-blood-deep"
                                  : "bg-smoke text-mute"
                              )}
                            >
                              {d.available ? "Available" : "Unavailable"}
                            </span>
                          </div>
                        </Td>
                        <Td>
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              disabled={busyId === d.id}
                              onClick={() => void act(d.id, d.verified ? "unverify" : "verify")}
                              className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-3.5 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-blood hover:text-blood disabled:opacity-60"
                            >
                              {busyId === d.id ? <Loader2 size={13} className="animate-spin" /> : d.verified ? <X size={13} /> : <BadgeCheck size={13} />}
                              {d.verified ? "Unverify" : "Verify"}
                            </button>
                            <button
                              type="button"
                              disabled={busyId === d.id}
                              onClick={() => void act(d.id, "remove")}
                              className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-3.5 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-blood hover:text-blood disabled:opacity-60"
                              aria-label={`Remove ${d.name}`}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </TableWrap>
              )}
            </div>
          )}

          {tab === "requests" && (
            <div className="space-y-4">
              {requests === null ? (
                loadingBlock
              ) : requests.length === 0 ? (
                <div className="rounded-3xl border border-fog bg-white p-12 text-center text-sm text-mute">
                  No blood requests yet.
                </div>
              ) : (
                <TableWrap>
                  <thead>
                    <tr>
                      <Th>Request</Th>
                      <Th>Group</Th>
                      <Th>Location</Th>
                      <Th>Units</Th>
                      <Th>Contact</Th>
                      <Th>Posted</Th>
                      <Th>Status</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((r) => (
                      <tr key={r.id} className="hover:bg-smoke/40">
                        <Td>
                          <p className="font-semibold text-ink">#{r.id}</p>
                          {r.hospital && <p className="text-xs text-mute">{r.hospital}</p>}
                        </Td>
                        <Td>
                          <span className="inline-flex h-8 w-11 items-center justify-center rounded-lg bg-blood font-display text-sm font-bold text-white">
                            {r.bloodGroup}
                          </span>
                        </Td>
                        <Td>
                          <p className="text-ink">{r.area}</p>
                          <p className="text-xs text-mute">{r.city}</p>
                        </Td>
                        <Td className="text-ink">{r.units}</Td>
                        <Td className="text-ink">{r.contact}</Td>
                        <Td>
                          <p className="text-xs text-mute">{relativeTime(r.createdAt)}</p>
                          <p className="text-[11px] text-mute/70">
                            {r.notifiedCount} notified
                          </p>
                        </Td>
                        <Td>
                          <span
                            className={cn(
                              "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize",
                              STATUS_STYLE[r.status]
                            )}
                          >
                            {r.status}
                          </span>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </TableWrap>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}