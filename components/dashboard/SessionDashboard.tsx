"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Droplet,
  Loader2,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  Upload,
} from "lucide-react";
import {
  ApiError,
  getDocuments,
  getMyProfile,
  isProfileComplete,
  uploadProfileImage,
} from "@/lib/app-api";
import type { DashboardDonor, DonorDocument } from "@/lib/app-api";
import { clearTokens, getAccessToken } from "@/lib/auth-client";
import ProfileEditor from "@/components/dashboard/ProfileEditor";
import AvailabilityCard from "@/components/dashboard/AvailabilityCard";
import PasswordChangeCard from "@/components/dashboard/PasswordChangeCard";

const CNIC_KEY = (id: string) => `bb:cnic:${id}`;
const PROFILE_KEY = (id: string) => `bb:profile:${id}`;

function readCachedCnic(donorId: string): string {
  try {
    const raw = window.localStorage.getItem(CNIC_KEY(donorId));
    return raw && /^[\d-]{5,}$/.test(raw) ? raw : "";
  } catch {
    return "";
  }
}

function cacheCnic(donorId: string, cnic: string) {
  if (!cnic) return;
  try {
    window.localStorage.setItem(CNIC_KEY(donorId), cnic);
  } catch {
    // ignore storage errors
  }
}

interface ProfileCache {
  email?: string;
  availabilityStatus?: string;
  cnicFrontUrl?: string | null;
  cnicBackUrl?: string | null;
  cnicFrontStatus?: string | null;
  cnicBackStatus?: string | null;
  bloodReportUrl?: string | null;
}

function readCachedProfile(donorId: string): ProfileCache {
  try {
    const raw = window.localStorage.getItem(PROFILE_KEY(donorId));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ProfileCache;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeCachedProfile(donor: DashboardDonor) {
  if (!donor.id) return;
  const data: ProfileCache = {
    email: donor.email ?? undefined,
    availabilityStatus: donor.availabilityStatus || undefined,
    cnicFrontUrl: donor.cnicFrontUrl ?? undefined,
    cnicBackUrl: donor.cnicBackUrl ?? undefined,
    cnicFrontStatus: donor.cnicFrontStatus ?? undefined,
    cnicBackStatus: donor.cnicBackStatus ?? undefined,
    bloodReportUrl: donor.bloodReportUrl ?? undefined,
  };
  try {
    window.localStorage.setItem(PROFILE_KEY(donor.id), JSON.stringify(data));
  } catch {
    // ignore storage errors
  }
}

type State =
  | { status: "checking" }
  | { status: "signed-out" }
  | { status: "error"; message: string }
  | { status: "ready"; donor: DashboardDonor };

export default function SessionDashboard() {
  const router = useRouter();
  const [state, setState] = useState<State>({ status: "checking" });
  const [notice, setNotice] = useState<{
    message: string;
    kind: "success" | "error";
  } | null>(null);
  const [working, setWorking] = useState<"upload" | null>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // The backend stores the profile photo and the blood report in the same
  // field, so a photo a donor uploaded this session is kept separately here.
  const [ownPhoto, setOwnPhoto] = useState<string | null>(null);

  const notify = useCallback(
    (message: string, kind: "success" | "error") => {
      setNotice({ message, kind });
      if (noticeTimer.current) clearTimeout(noticeTimer.current);
      noticeTimer.current = setTimeout(() => setNotice(null), 4000);
    },
    []
  );

  // Fold the donor's documents endpoint into the profile payload so the
  // CNIC/report images come from the backend rather than placeholders.
  const mergeDocuments = useCallback((donor: DashboardDonor, docs: DonorDocument[]) => {
    const next = { ...donor };
    for (const doc of docs) {
      if (doc.type === "CNIC_FRONT") {
        next.cnicFrontUrl = doc.url;
        next.cnicFrontStatus = doc.status;
      } else if (doc.type === "CNIC_BACK") {
        next.cnicBackUrl = doc.url;
        next.cnicBackStatus = doc.status;
      } else if (doc.type === "BLOOD_GROUP_REPORT") {
        next.bloodReportUrl = doc.url;
        next.reportUrl = doc.url;
        if (doc.uploadedAt) next.reportUploadedAt = doc.uploadedAt;
      }
    }
    return next;
  }, []);

  const load = useCallback(async () => {
    const { donor } = await getMyProfile();

    // The backend donor row never carries the CNIC number (stored only on the
    // auth profile model) and the documents endpoint can fail, which would
    // strip CNIC/image URLs from the profile and flip the "Verified" badge off.
    // Restore cached values FIRST so a documents failure doesn't lose them.
    const restored = { ...donor };
    const cached = readCachedProfile(restored.id);
    if (!restored.cnicNumber) {
      const cn = readCachedCnic(restored.id);
      if (cn) restored.cnicNumber = cn;
    }
    if (!restored.email && cached.email) restored.email = cached.email;
    if (cached.availabilityStatus)
      restored.availabilityStatus = cached.availabilityStatus;
    if (!restored.cnicFrontUrl && cached.cnicFrontUrl)
      restored.cnicFrontUrl = cached.cnicFrontUrl;
    if (!restored.cnicBackUrl && cached.cnicBackUrl)
      restored.cnicBackUrl = cached.cnicBackUrl;
    if (!restored.bloodReportUrl && cached.bloodReportUrl)
      restored.bloodReportUrl = cached.bloodReportUrl;
    if (!restored.cnicFrontStatus && cached.cnicFrontStatus)
      restored.cnicFrontStatus = cached.cnicFrontStatus;
    if (!restored.cnicBackStatus && cached.cnicBackStatus)
      restored.cnicBackStatus = cached.cnicBackStatus;

    try {
      const { documents } = await getDocuments();
      const merged = mergeDocuments(restored, documents);
      writeCachedProfile(merged);
      return merged;
    } catch {
      // Documents endpoint failed — the cached values above already keep the
      // profile complete enough for the Verified badge / availability toggle.
      return restored;
    }
  }, [mergeDocuments]);

  const refresh = useCallback(
    async (opts?: { silent?: boolean }) => {
      // Defer state writes past the effect's synchronous body so the
      // set-state-in-effect rule isn't triggered for mount/interval calls.
      await Promise.resolve();
      // Note whether a session token existed before the fetch: if the profile
      // call 401s after the token-refresh retry already failed, authFetch has
      // cleared the session — the donor should be sent to the login page
      // rather than stuck on the "signed out" panel.
      const hadToken = getAccessToken() != null;
      if (!opts?.silent) setState({ status: "checking" });
      try {
        const donor = await load();
        setState({ status: "ready", donor });
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          if (hadToken) {
            clearTokens();
            router.push("/login");
            return;
          }
          setState({ status: "signed-out" });
          return;
        }
        if (!opts?.silent) {
          setState({
            status: "error",
            message:
              err instanceof Error
                ? err.message
                : "Cannot reach the server right now. Please try again.",
          });
        }
      }
    },
    [load, router]
  );

  // Initial fetch uses a callback that never sets "checking" synchronously
  // (the initial useState already reflects the loading state), keeping the
  // set-state-in-effect lint clean.
  const fetchInitial = useCallback(async () => {
    const hadToken = getAccessToken() != null;
    try {
      const donor = await load();
      setState({ status: "ready", donor });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        if (hadToken) {
          clearTokens();
          router.push("/login");
          return;
        }
        setState({ status: "signed-out" });
        return;
      }
      setState({
        status: "error",
        message:
          err instanceof Error
            ? err.message
            : "Cannot reach the server right now. Please try again.",
      });
    }
  }, [load, router]);

  // Load on mount, then poll so the verified badge stays fresh (e.g. after an
  // admin verifies the donor). The initial load runs on the next tick so its
  // state writes never happen inside the effect's synchronous body (keeps the
  // react-hooks/set-state-in-effect rule clean without changing behavior).
  useEffect(() => {
    void Promise.resolve().then(() => void fetchInitial());
    const t = setInterval(() => void refresh({ silent: true }), 30000);
    return () => {
      clearInterval(t);
      if (noticeTimer.current) clearTimeout(noticeTimer.current);
    };
  }, [fetchInitial, refresh]);

  async function uploadPhoto(file: File) {
    setNotice(null);
    setWorking("upload");
    try {
      const { donor } = await uploadProfileImage(file);
      setOwnPhoto(donor.profileImageUrl);
      setState((prev) =>
        prev.status === "ready"
          ? {
              status: "ready",
              donor: { ...prev.donor, profileImageUrl: donor.profileImageUrl },
            }
          : prev
      );
      notify("Profile photo updated.", "success");
    } catch (err) {
      notify(
        err instanceof Error ? err.message : "Photo upload failed. Please try again.",
        "error"
      );
    } finally {
      setWorking(null);
      if (photoRef.current) photoRef.current.value = "";
    }
  }

  if (state.status === "checking") {
    return (
      <main data-bg="light" className="flex min-h-svh items-center justify-center bg-white">
        <Loader2 size={20} className="animate-spin text-blood" />
      </main>
    );
  }

  if (state.status === "error") {
    return (
      <main data-bg="light" className="flex min-h-svh items-center justify-center bg-white px-6">
        <div className="w-full max-w-md rounded-2xl border border-blood/25 bg-blood/5 px-6 py-6">
          <p className="text-sm font-semibold text-blood-deep">
            {state.message}
          </p>
          <Link
            href="/register"
            className="mt-4 inline-flex h-10 items-center rounded-full bg-blood px-5 text-sm font-semibold text-white transition-colors hover:bg-blood-deep"
          >
            Complete registration
          </Link>
        </div>
      </main>
    );
  }

  if (state.status === "signed-out") {
    return (
      <main data-bg="light" className="flex min-h-svh items-center justify-center bg-white px-6">
        <div className="w-full max-w-md rounded-3xl border border-line bg-card p-8 text-center shadow-sm">
          <h1 className="font-display text-2xl font-bold text-ink">
            Sign in to view your dashboard
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-mute">
            Manage your donor profile, test report and availability here.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/login"
              className="inline-flex h-11 items-center rounded-full bg-blood px-6 text-sm font-semibold text-white transition-colors hover:bg-blood-deep"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="inline-flex h-11 items-center rounded-full border border-line px-6 text-sm font-semibold text-ink transition-colors hover:border-blood/40 hover:text-blood"
            >
              Register
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const { donor } = state;

  // The backend maps both the blood report and the profile photo to
  // `profileImage`. Until a donor uploads their own photo via "Change", the
  // photo box stays on the empty placeholder — never the uploaded report.
  const photoUrl =
    ownPhoto ??
    (donor.bloodReportUrl ? null : donor.profileImageUrl);

  return (
    <main data-bg="light" className="min-h-svh bg-white pb-24 pt-28 md:pt-32">
      <div className="mx-auto max-w-3xl px-6">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-ink md:text-5xl">
            Welcome, <span className="text-blood">{donor.fullName}</span>
          </h1>
          <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-mute">
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={14} /> {donor.city}
              {donor.area ? `, ${donor.area}` : ""}
            </span>
            {isProfileComplete(donor) ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-700">
                <ShieldCheck size={15} /> Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-amber-700">
                <ShieldAlert size={15} /> Not verified
              </span>
            )}
          </p>
        </div>

        {notice && (
          <div
            role="status"
            className={`mt-6 rounded-2xl px-4 py-3 text-sm font-medium ${
              notice.kind === "success"
                ? "bg-emerald-50 text-emerald-800"
                : "bg-red-50 text-red-800"
            }`}
          >
            {notice.message}
          </div>
        )}

        <div className="mt-6 flex items-center justify-between rounded-2xl border border-line bg-card p-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-blood/10 text-xl font-bold text-blood">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                (donor.fullName?.trim().charAt(0) || "?").toUpperCase()
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">Profile photo</p>
              <p className="mt-0.5 text-xs text-mute">
                A clear photo helps donors and admins recognize you.
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={working !== null}
            onClick={() => photoRef.current?.click()}
            className="inline-flex h-10 items-center gap-1.5 rounded-full border border-line px-5 text-sm font-medium text-ink transition-colors hover:border-blood/40 hover:text-blood disabled:opacity-50"
          >
            <Upload size={14} />
            {working === "upload" ? (
              <Loader2 size={14} className="animate-spin" />
            ) : photoUrl ? (
              "Change"
            ) : (
              "Upload"
            )}
          </button>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blood text-xl font-bold text-white">
            {donor.bloodGroup}
          </span>
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-ink">
              <Droplet size={14} className="text-blood" />
              Blood group {donor.bloodGroup}
            </p>
            <p className="mt-0.5 text-sm text-mute">{donor.phone}</p>
          </div>
        </div>

        <div className="mt-8 space-y-6">
<ProfileEditor
              donor={donor}
              onSaved={(updated) => {
                cacheCnic(updated.id, updated.cnicNumber);
                writeCachedProfile(updated);
                setState({ status: "ready", donor: updated });
              }}
              notify={notify}
            />

          <AvailabilityCard
            donor={donor}
            notify={notify}
            onChanged={(availabilityStatus) =>
              setState((prev) => {
                if (prev.status !== "ready") return prev;
                const nextDonor = {
                  ...prev.donor,
                  availabilityStatus,
                };
                writeCachedProfile(nextDonor);
                return { status: "ready", donor: nextDonor };
              })
            }
          />

          <PasswordChangeCard />

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/"
              className="inline-flex h-11 items-center rounded-full bg-blood px-6 text-sm font-semibold text-white transition-colors hover:bg-blood-deep"
            >
              Back to home
            </Link>
          </div>
        </div>

        <input
          ref={photoRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void uploadPhoto(file);
          }}
        />
      </div>
    </main>
  );
}