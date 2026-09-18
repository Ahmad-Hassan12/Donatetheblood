"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  Camera,
  Check,
  FileText,
  Loader2,
  MapPin,
  Pencil,
  X,
} from "lucide-react";
import {
  ApiError,
  getMyProfile,
  isProfileComplete,
  updateProfile,
} from "@/lib/app-api";
import type {
  DashboardDonor,
  UpdateProfileFiles,
  UpdateProfilePayload,
} from "@/lib/app-api";
import { profileEditSchema } from "@/lib/schemas";
import { BLOOD_GROUPS } from "@/lib/search-types";
import type { BloodGroup } from "@/lib/search-types";
import { cn } from "@/lib/cn";
import { Field } from "@/components/ui/FormInputs";
import BloodGroupSelector from "@/components/ui/BloodGroupSelector";
import UseLocationButton from "@/components/ui/UseLocationButton";

const DOC_ACCEPT = "image/jpeg,image/png,image/webp,application/pdf";
const CNIC_ACCEPT = "image/jpeg,image/png,image/webp";
const MAX_RAW_BYTES = 5 * 1024 * 1024;

const LocationPinMap = dynamic(() => import("@/components/ui/LocationPinMap"), {
  ssr: false,
  loading: () => (
    <div className="bb-map h-64 w-full animate-pulse rounded-2xl bg-smoke" />
  ),
});

function formatCnic(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 13);
  if (digits.length <= 5) return digits;
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
}

interface ProfileEditorProps {
  donor: DashboardDonor;
  onSaved: (donor: DashboardDonor) => void;
  onEditingChange?: (editing: boolean) => void;
  notify: (message: string, kind: "success" | "error") => void;
}

type Draft = {
  fullName: string;
  phone: string;
  email: string;
  bloodGroup: string;
  city: string;
  area: string;
  cnicNumber: string;
  latitude: number | null;
  longitude: number | null;
  cnicFrontUrl: string | null;
  cnicBackUrl: string | null;
  cnicFrontStatus: string | null;
  cnicBackStatus: string | null;
  bloodReportUrl: string | null;
};

function toDraft(donor: DashboardDonor): Draft {
  return {
    fullName: donor.fullName,
    phone: donor.phone,
    email: donor.email ?? "",
    bloodGroup: donor.bloodGroup,
    city: donor.city,
    area: donor.area,
    cnicNumber: donor.cnicNumber,
    latitude: donor.latitude,
    longitude: donor.longitude,
    cnicFrontUrl: donor.cnicFrontUrl,
    cnicBackUrl: donor.cnicBackUrl,
    cnicFrontStatus: donor.cnicFrontStatus,
    cnicBackStatus: donor.cnicBackStatus,
    bloodReportUrl: donor.bloodReportUrl,
  };
}

type FieldErrors = Partial<Record<keyof Draft, string>>;

type DocKey = "cnicFront" | "cnicBack" | "bloodReport";

interface StagedDoc {
  file: File;
  preview: string;
}

function DocField({
  label,
  hint,
  url,
  docKey,
  onChange,
}: {
  label: string;
  hint: string;
  url: string | null;
  docKey: "cnicFront" | "cnicBack" | "bloodReport";
  onChange: (
    docKey: "cnicFront" | "cnicBack" | "bloodReport",
    file: File
  ) => Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isPdf = url?.toLowerCase().endsWith(".pdf") ?? false;
  const isCnic = docKey === "cnicFront" || docKey === "cnicBack";
  const accept = isCnic ? CNIC_ACCEPT : DOC_ACCEPT;

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    if (isCnic) {
      if (!CNIC_ACCEPT.split(",").includes(file.type)) {
        setError("Use a JPG, PNG or WebP image.");
        return;
      }
      if (file.size > MAX_RAW_BYTES) {
        setError("Image is larger than 5 MB. Please use a smaller one.");
        return;
      }
    }
    setBusy(true);
    try {
      await onChange(docKey, file);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Upload failed. Please try again."
      );
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink">
            {label}
          </p>
          <p className="mt-0.5 text-xs text-mute">{hint}</p>
        </div>
      </div>

      <div
        className={
          "group relative mt-2 overflow-hidden rounded-xl border-2 border-dashed transition-colors " +
          (error
            ? "border-blood/50 bg-blood/5"
            : "border-ink/15 bg-smoke/40 hover:border-blood/40")
        }
      >
        {url ? (
          <>
            {isPdf ? (
              <div className="flex h-44 w-full items-center justify-center bg-smoke">
                <FileText size={28} className="text-blood" />
              </div>
            ) : (
              <img
                src={url}
                alt={label}
                className="h-44 w-full object-cover object-center"
              />
            )}
            <div className="absolute inset-x-0 bottom-0 flex justify-end bg-gradient-to-t from-black/70 to-transparent px-3 pb-3 pt-8">
              <button
                type="button"
                disabled={busy}
                onClick={() => inputRef.current?.click()}
                className="rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-smoke disabled:opacity-50"
              >
                {busy ? "Uploading…" : "Replace"}
              </button>
            </div>
          </>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="flex h-36 w-full flex-col items-center justify-center gap-2 text-mute transition-colors hover:text-blood disabled:opacity-50"
          >
            {busy ? (
              <Loader2 size={22} className="animate-spin" />
            ) : (
              <Camera size={22} />
            )}
            <span className="text-sm font-semibold">
              {busy ? "Uploading…" : "Upload"}
            </span>
          </button>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-700">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />
    </div>
  );
}

export default function ProfileEditor({
  donor,
  onSaved,
  onEditingChange,
  notify,
}: ProfileEditorProps) {
  // `draft` is only set while editing. It is seeded fresh from the donor on
  // edit start and cleared on save/cancel, so a changing `donor` prop never
  // clobbers in-progress changes.
  const [draft, setDraft] = useState<Draft | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [docBusy, setDocBusy] = useState(false);
  const [docError, setDocError] = useState<string | null>(null);
  const [locError, setLocError] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);
  // Files the donor swapped in this editing session. They're submitted with
  // the single multipart "Save changes" PUT so existing uploads are only
  // replaced when the donor actually picked a new file.
  const [stagedDocs, setStagedDocs] = useState<Partial<Record<DocKey, StagedDoc>>>({});

  const editing = draft !== null;

  // Tear down any object-URL previews created while staging docs.
  function releaseStagedDocs() {
    setStagedDocs((prev) => {
      for (const s of Object.values(prev)) {
        if (s) URL.revokeObjectURL(s.preview);
      }
      return {};
    });
  }

  function startEditing() {
    setDraft(toDraft(donor));
    setErrors({});
    setDocError(null);
    setLocError(null);
    setShowMap(donor.latitude != null && donor.longitude != null);
    onEditingChange?.(true);
  }

  function cancelEditing() {
    releaseStagedDocs();
    setDraft(null);
    setErrors({});
    setDocError(null);
    setLocError(null);
    setShowMap(false);
    onEditingChange?.(false);
  }

  function set(field: keyof Draft, value: string) {
    setDraft((prev) => (prev ? { ...prev, [field]: value } : prev));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  async function save() {
    if (!draft) return;
    setSaving(true);
    setDocError(null);
    try {
      const valid = profileEditSchema.safeParse(draft);
      if (!valid.success) {
        const flattened = valid.error.flatten().fieldErrors;
        setErrors(
          Object.fromEntries(
            Object.entries(flattened).map(([k, v]) => [
              k,
              (v ?? [])[0] ?? "Invalid value",
            ])
          ) as FieldErrors
        );
        return;
      }
      const payload: UpdateProfilePayload = {
        fullName: draft.fullName,
        phone: draft.phone,
        bloodGroup: draft.bloodGroup,
        city: draft.city,
        area: draft.area,
        cnicNumber: draft.cnicNumber,
        email: draft.email,
        latitude: draft.latitude,
        longitude: draft.longitude,
      };

      // Completing the profile (all fields + all three documents) self-applies
      // the Verified badge and auto-turns availability ON — in the same PUT so
      // the backend never sees a second, partial update.
      const shouldEnable =
        isProfileComplete(draft) && donor.availabilityStatus !== "available";
      if (shouldEnable) payload.isAvailable = true;

      // Only swap files the donor actually chose this session — anything not
      // staged is left untouched on the server.
      const files: UpdateProfileFiles = {
        cnicFront: stagedDocs.cnicFront?.file ?? null,
        cnicBack: stagedDocs.cnicBack?.file ?? null,
        bloodReport: stagedDocs.bloodReport?.file ?? null,
      };

      const data = (await updateProfile(payload, files)).donor;
      // The multipart PUT response omits the document URLs, so re-fetch the
      // profile for the authoritative uploaded-file list (best-effort).
      let freshDonor: DashboardDonor | null = null;
      try {
        freshDonor = (await getMyProfile()).donor;
      } catch {
        // PUT already succeeded — fall back to its payload.
      }
      const base = freshDonor && freshDonor.id === data.id ? freshDonor : data;

      // Keep any client-side values the response didn't echo back.
      const saved: DashboardDonor = {
        ...base,
        fullName: draft.fullName,
        phone: draft.phone,
        email: draft.email,
        bloodGroup: draft.bloodGroup,
        city: draft.city,
        area: draft.area,
        cnicNumber: draft.cnicNumber || base.cnicNumber,
        cnicFrontUrl: base.cnicFrontUrl ?? draft.cnicFrontUrl,
        cnicBackUrl: base.cnicBackUrl ?? draft.cnicBackUrl,
        cnicFrontStatus: base.cnicFrontStatus ?? draft.cnicFrontStatus,
        cnicBackStatus: base.cnicBackStatus ?? draft.cnicBackStatus,
        bloodReportUrl: base.bloodReportUrl ?? draft.bloodReportUrl,
        ...(shouldEnable && base.availabilityStatus === "available"
          ? { availabilityStatus: "available" as const }
          : {}),
      };

      const autoEnabled =
        shouldEnable && saved.availabilityStatus === "available";

      releaseStagedDocs();
      setDraft(null);
      setErrors({});
      onEditingChange?.(false);
      onSaved(saved);
      notify(
        autoEnabled
          ? "Profile saved. You're now available for donation requests."
          : "Profile saved.",
        "success"
      );
    } catch (err) {
      if (err instanceof ApiError && err.issues) {
        setErrors(err.issues as FieldErrors);
      }
      notify(
        err instanceof Error ? err.message : "Could not save your profile.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDocChange(
    docKey: "cnicFront" | "cnicBack" | "bloodReport",
    file: File
  ) {
    setDocBusy(true);
    setDocError(null);
    try {
      // Stage the file for the "Save changes" multipart request and preview it
      // locally instead of hitting a separate upload endpoint.
      const preview = URL.createObjectURL(file);
      setStagedDocs((prev) => {
        for (const s of Object.values(prev)) {
          if (s) URL.revokeObjectURL(s.preview);
        }
        return { ...prev, [docKey]: { file, preview } };
      });
      setDraft((prev) => {
        if (!prev) return prev;
        const patch: Partial<Draft> =
          docKey === "cnicFront"
            ? { cnicFrontUrl: preview, cnicFrontStatus: null }
            : docKey === "cnicBack"
              ? { cnicBackUrl: preview, cnicBackStatus: null }
              : { bloodReportUrl: preview };
        return { ...prev, ...patch };
      });
      notify("File ready — press “Save changes” to upload it.", "success");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "That file couldn't be read. Try again.";
      setDocError(message);
      notify(message, "error");
    } finally {
      setDocBusy(false);
    }
  }

  return (
    <section className="rounded-3xl border border-line bg-card p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-ink">
            Profile
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-mute">
            Your details are used to match you with requests. Only your city,
            area and blood group are shown publicly.
          </p>
        </div>
        {!editing && (
          <button
            type="button"
            onClick={startEditing}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-line px-5 text-sm font-semibold text-ink transition-colors hover:border-blood/40 hover:text-blood"
          >
            <Pencil size={15} />
            Edit profile
          </button>
        )}
      </div>

      {editing && draft ? (
        <>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field
              label="Full name"
              htmlFor="edit-fullName"
              error={errors.fullName}
            >
              <input
                id="edit-fullName"
                type="text"
                value={draft.fullName}
                onChange={(e) => set("fullName", e.target.value)}
                className="h-11 w-full rounded-xl border border-line bg-white px-3.5 text-sm text-ink outline-none transition-colors focus:border-blood"
              />
            </Field>

            <Field
              label="Phone"
              htmlFor="edit-phone"
              hint="Format: 0300 1234567"
              error={errors.phone}
            >
              <input
                id="edit-phone"
                type="tel"
                value={draft.phone}
                onChange={(e) => set("phone", e.target.value)}
                className="h-11 w-full rounded-xl border border-line bg-white px-3.5 text-sm text-ink outline-none transition-colors focus:border-blood"
              />
            </Field>

            <Field
              label="Email"
              htmlFor="edit-email"
              hint="Used to receive donation requests"
              error={errors.email}
            >
              <input
                id="edit-email"
                type="email"
                value={draft.email}
                onChange={(e) => set("email", e.target.value)}
                className="h-11 w-full rounded-xl border border-line bg-white px-3.5 text-sm text-ink outline-none transition-colors focus:border-blood"
              />
            </Field>

            <Field label="Blood group" htmlFor="edit-bloodGroup">
              <div className="pt-1">
                <BloodGroupSelector
                  value={
                    (BLOOD_GROUPS as readonly string[]).includes(draft.bloodGroup)
                      ? (draft.bloodGroup as BloodGroup)
                      : null
                  }
                  onChange={(group) => {
                    if (group) set("bloodGroup", group);
                  }}
                />
              </div>
            </Field>

            <Field label="City" htmlFor="edit-city" error={errors.city}>
              <input
                id="edit-city"
                type="text"
                value={draft.city}
                onChange={(e) => set("city", e.target.value)}
                className="h-11 w-full rounded-xl border border-line bg-white px-3.5 text-sm text-ink outline-none transition-colors focus:border-blood"
              />
            </Field>

            <Field label="Area" htmlFor="edit-area" error={errors.area}>
              <input
                id="edit-area"
                type="text"
                value={draft.area}
                onChange={(e) => set("area", e.target.value)}
                className="h-11 w-full rounded-xl border border-line bg-white px-3.5 text-sm text-ink outline-none transition-colors focus:border-blood"
              />
            </Field>

            <Field
              label="CNIC"
              htmlFor="edit-cnic"
              hint="Format: 42101-1234567-8"
              error={errors.cnicNumber}
            >
              <input
                id="edit-cnic"
                type="text"
                value={draft.cnicNumber}
                onChange={(e) => set("cnicNumber", formatCnic(e.target.value))}
                className="h-11 w-full rounded-xl border border-line bg-white px-3.5 text-sm text-ink outline-none transition-colors focus:border-blood"
              />
            </Field>
          </div>

          <div className="mt-6 border-t border-line pt-5">
            <h3 className="text-sm font-semibold text-ink">Location</h3>
            <p className="mt-1 text-xs leading-relaxed text-mute">
              Pin your location so matching in Find a Donor finds you at the
              right place. Your pin is only used once an admin verifies your
              profile.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <UseLocationButton
                onLocated={(place) => {
                  setDraft((prev) =>
                    prev
                      ? {
                          ...prev,
                          latitude: place.latitude,
                          longitude: place.longitude,
                        }
                      : prev
                  );
                  setLocError(null);
                  setShowMap(true);
                }}
                onNotice={(m) => setLocError(m)}
              />
              {draft.latitude != null && draft.longitude != null && (
                <span className="inline-flex items-center gap-2 rounded-full bg-smoke px-3 py-1.5 text-xs font-medium text-ink">
                  <MapPin size={13} className="text-blood" />
                  {draft.latitude.toFixed(4)}, {draft.longitude.toFixed(4)}
                  <button
                    type="button"
                    aria-label="Clear location"
                    onClick={() => {
                      setDraft((prev) =>
                        prev
                          ? { ...prev, latitude: null, longitude: null }
                          : prev
                      );
                      setShowMap(false);
                    }}
                    className="text-mute transition-colors hover:text-blood"
                  >
                    <X size={13} />
                  </button>
                </span>
              )}
            </div>
            {locError && <p className="mt-2 text-xs text-red-700">{locError}</p>}
            {showMap && draft.latitude != null && draft.longitude != null && (
              <div className="mt-3">
                <LocationPinMap
                  latitude={draft.latitude}
                  longitude={draft.longitude}
                  onChange={(lat, lng) =>
                    setDraft((prev) =>
                      prev ? { ...prev, latitude: lat, longitude: lng } : prev
                    )
                  }
                />
              </div>
            )}
          </div>

          <div className="mt-6 border-t border-line pt-5">
            <h3 className="text-sm font-semibold text-ink">Documents</h3>
            <p className="mt-1 text-xs leading-relaxed text-mute">
              Replace a document below. Uploading a fresh blood-group report
              keeps you available for emergency donation requests.
            </p>
            {docError && <p className="mt-2 text-xs text-red-700">{docError}</p>}
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <DocField
                label="CNIC front"
                hint="Keep it readable"
                url={draft.cnicFrontUrl}
                docKey="cnicFront"
                onChange={handleDocChange}
              />
              <DocField
                label="CNIC back"
                hint="Keep it readable"
                url={draft.cnicBackUrl}
                docKey="cnicBack"
                onChange={handleDocChange}
              />
              <DocField
                label="Blood-group report"
                hint="Fresh test result, valid 90 days"
                url={draft.bloodReportUrl}
                docKey="bloodReport"
                onChange={handleDocChange}
              />
            </div>
            {docBusy && (
              <p className="mt-3 flex items-center gap-1.5 text-xs text-mute">
                <Loader2 size={13} className="animate-spin" /> Uploading…
              </p>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={cancelEditing}
              disabled={saving}
              className="inline-flex h-10 items-center gap-1.5 rounded-full border border-line px-5 text-sm font-medium text-ink transition-colors hover:border-blood/40 hover:text-blood disabled:opacity-50"
            >
              <X size={15} />
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void save()}
              disabled={saving}
              className={cn(
                "inline-flex h-10 items-center gap-1.5 rounded-full px-6 text-sm font-semibold text-white transition-colors hover:bg-blood-deep disabled:opacity-50",
                saving ? "bg-blood/70" : "bg-blood"
              )}
            >
              {saving ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Check size={15} />
              )}
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </>
      ) : (
        <dl className="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wide text-mute">Name</dt>
            <dd className="mt-0.5 font-medium text-ink">{donor.fullName}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-mute">Phone</dt>
            <dd className="mt-0.5 font-medium text-ink">{donor.phone}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-mute">Email</dt>
            <dd className="mt-0.5 font-medium text-ink">{donor.email ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-mute">CNIC</dt>
            <dd className="mt-0.5 font-medium text-ink">{donor.cnicNumber || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-mute">
              Location
            </dt>
            <dd className="mt-0.5 font-medium text-ink">
              {donor.city}
              {donor.area ? `, ${donor.area}` : ""}
            </dd>
          </div>
        </dl>
      )}
    </section>
  );
}