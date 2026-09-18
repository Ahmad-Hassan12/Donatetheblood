/**
 * Frontend API layer — all client-side data fetching goes through here.
 * Each function wraps a call to a Next.js API route, which proxies to the
 * Node.js backend. Authenticated calls ride on the Bearer tokens managed by
 * `lib/auth-client.ts` (auto-refresh on 401).
 */

import { authFetch } from "@/lib/auth-client";
import { bloodGroupFromBackend, bloodGroupToBackend } from "@/lib/blood-group-map";
import type { DonorPagination, DonorSearchResponse, DonorSearchResult } from "@/lib/search-types";
import type { BloodGroup } from "@/lib/search-types";

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

export class ApiError extends Error {
  status: number;
  issues?: Record<string, string>;
  constructor(message: string, status: number, issues?: Record<string, string>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.issues = issues;
  }
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DocumentField = "cnicFront" | "cnicBack" | "bloodReport";

/** Maps the UI's document field names to the backend's document `type` enum. */
export const DOC_TYPE_MAP: Record<DocumentField, string> = {
  cnicFront: "CNIC_FRONT",
  cnicBack: "CNIC_BACK",
  bloodReport: "BLOOD_GROUP_REPORT",
};

export interface DonorDocument {
  id: string | null;
  type: string;
  url: string;
  status: string | null;
  rejectionReason: string | null;
  uploadedAt: string | null;
  reviewedAt: string | null;
}

export interface DashboardDonor {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  bloodGroup: string;
  city: string;
  area: string;
  cnicNumber: string;
  latitude: number | null;
  longitude: number | null;
  profileImageUrl: string | null;
  cnicFrontUrl: string | null;
  cnicBackUrl: string | null;
  cnicFrontStatus: string | null;
  cnicBackStatus: string | null;
  bloodReportUrl: string | null;
  reportUrl: string | null;
  reportUploadedAt: string | null;
  availabilityStatus: string;
  lastReminderSentAt: string | null;
  isVerified: boolean;
  createdAt: string;
}

export interface UpdateProfilePayload {
  fullName: string;
  phone: string;
  bloodGroup: string;
  city: string;
  area: string;
  cnicNumber?: string;
  email?: string;
  latitude: number | null;
  longitude: number | null;
  isAvailable?: boolean;
}

/** Files a donor chose to change; only these are sent so existing uploads aren't wiped. */
export interface UpdateProfileFiles {
  cnicFront?: File | null;
  cnicBack?: File | null;
  bloodReport?: File | null;
  profileImage?: File | null;
}

/**
 * A donor's profile is only "complete" when every required field is filled
 * AND all three documents (CNIC front, CNIC back, blood-group report) are
 * uploaded. Completeness self-applies the "Verified" badge and unlocks the
 * availability toggle — no admin action required.
 */
export function isProfileComplete(donor: {
  fullName: string;
  phone: string;
  email: string | null;
  bloodGroup: string;
  city: string;
  area: string;
  cnicNumber: string;
  cnicFrontUrl: string | null;
  cnicBackUrl: string | null;
  bloodReportUrl: string | null;
}): boolean {
  return Boolean(
    donor.fullName.trim() &&
      donor.phone.trim() &&
      (donor.email ?? "").trim() &&
      donor.bloodGroup.trim() &&
      donor.city.trim() &&
      donor.area.trim() &&
      donor.cnicNumber.trim() &&
      donor.cnicFrontUrl &&
      donor.cnicBackUrl &&
      donor.bloodReportUrl
  );
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function errorMessage(body: unknown, status: number): {
  message: string;
  issues?: Record<string, string>;
} {
  if (body && typeof body === "object") {
    const b = body as Record<string, unknown>;
    const msg =
      typeof b.message === "string"
        ? b.message
        : typeof b.error === "string"
          ? b.error
          : `Request failed (${status})`;
    let issues: Record<string, string> | undefined;
    if (b.issues && typeof b.issues === "object") {
      issues = b.issues as Record<string, string>;
    }
    return { message: msg, issues };
  }
  return { message: `Request failed (${status})` };
}

type BackendEnvelope<T> = { success: boolean; data?: T; [key: string]: unknown };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await authFetch(path, init);
  if (!res.ok) {
    let body: unknown = null;
    try {
      body = await res.json();
    } catch {
      // no body
    }
    const { message, issues } = errorMessage(body, res.status);
    throw new ApiError(message, res.status, issues);
  }
  try {
    return (await res.json()) as T;
  } catch {
    // Some backends return 204/empty on success — synthesize an empty envelope.
    return { success: true } as T;
  }
}

/** Pulls the raw payload out of the backend's `{ success, data }` envelope. */
function unwrapEnvelope<T>(body: BackendEnvelope<T> | T): T {
  if (body && typeof body === "object" && "data" in body) {
    return (body as { data: T }).data;
  }
  return body as T;
}

/** Finds the donor object in the profile GET/PUT response, whatever nesting. */
function unwrapDonor(body: unknown): Record<string, unknown> {
  if (!body || typeof body !== "object") {
    throw new ApiError("Unexpected profile response.", 0);
  }
  const walk = (obj: Record<string, unknown>): unknown => {
    for (const key of ["donor", "profile", "user"]) {
      if (key in obj && obj[key] && typeof obj[key] === "object") {
        return obj[key];
      }
    }
    if ("data" in obj && obj.data && typeof obj.data === "object") {
      return walk(obj.data as Record<string, unknown>);
    }
    return obj;
  };
  const d = walk(body as Record<string, unknown>);
  if (!d || typeof d !== "object") {
    throw new ApiError("Unexpected profile response.", 0);
  }
  return d as Record<string, unknown>;
}

/**
 * Maps the backend's live profile payload to the dashboard's donor shape.
 * `GET /auth/profile` returns everything in `data`: the donor row plus
 * `documents[]` (CNIC front/back) and `bloodTestReports[]` (report file).
 * `isAvailable` drives the availability toggle.
 */
function mapBackendDonor(d: Record<string, unknown>): DashboardDonor {
  const str = (v: unknown): string => (typeof v === "string" ? v : "");
  const numOrNull = (v: unknown): number | null => (typeof v === "number" ? v : null);
  const backendGroup = str(d.bloodGroup);
  const rawDocs = Array.isArray(d.documents) ? d.documents : [];
  const docs = rawDocs.map((x) => mapBackendDocument(x as Record<string, unknown>));
  const rawReports = Array.isArray(d.bloodTestReports) ? d.bloodTestReports : [];
  const report = rawReports[0] as Record<string, unknown> | undefined;
  const front = docs.find((doc) => doc.type === "CNIC_FRONT");
  const back = docs.find((doc) => doc.type === "CNIC_BACK");
  const reportUrl = typeof report?.url === "string" ? report.url : null;
  return {
    id: str(d.id),
    fullName: str(d.fullName),
    phone: str(d.phone),
    email: typeof d.email === "string" ? d.email : null,
    bloodGroup: bloodGroupFromBackend(backendGroup) ?? backendGroup,
    city: str(d.city),
    area: str(d.area),
    cnicNumber: str(d.cnicNumber),
    latitude: numOrNull(d.latitude),
    longitude: numOrNull(d.longitude),
    profileImageUrl: typeof d.profileImage === "string" ? d.profileImage : null,
    cnicFrontUrl: front?.url ?? null,
    cnicBackUrl: back?.url ?? null,
    cnicFrontStatus: front?.status ?? null,
    cnicBackStatus: back?.status ?? null,
    bloodReportUrl: reportUrl,
    reportUrl,
    reportUploadedAt:
      typeof report?.uploadedAt === "string" ? report.uploadedAt : null,
    availabilityStatus:
      typeof d.isAvailable === "boolean"
        ? d.isAvailable
          ? "available"
          : "unavailable"
        : "unavailable",
    lastReminderSentAt: typeof d.lastReminderSentAt === "string" ? d.lastReminderSentAt : null,
    isVerified: typeof d.isVerified === "boolean" ? d.isVerified : false,
    createdAt: typeof d.createdAt === "string" ? d.createdAt : "",
  };
}

function toMappedDonor(body: unknown): DashboardDonor {
  return mapBackendDonor(unwrapDonor(body));
}

// ---------------------------------------------------------------------------
// Session / profile fetch
// ---------------------------------------------------------------------------

export async function getMyProfile(): Promise<{ donor: DashboardDonor }> {
  const profileBody = await request<unknown>("/api/auth/profile");
  const profile = unwrapEnvelope(profileBody) as Record<string, unknown> | null;
  if (!profile || typeof profile !== "object") {
    throw new ApiError("Unexpected profile response.", 0);
  }
  // GET /auth/profile returns the donor row (id, fullName, phone, email,
  // cnicNumber, bloodGroup, city, area, latitude/longitude, isAvailable,
  // profileImage) plus documents[] and bloodTestReports[] — everything the
  // dashboard renders, so no second donor fetch is needed.
  return { donor: mapBackendDonor(profile) };
}

// ---------------------------------------------------------------------------
// Update profile
// ---------------------------------------------------------------------------

export async function updateProfile(
  payload: UpdateProfilePayload,
  files?: UpdateProfileFiles
): Promise<{ donor: DashboardDonor }> {
  // The live backend accepts a single `PUT /auth/profile` (multipart/form-data)
  // carrying both the scalar fields and any file the donor changed — cnicFront,
  // cnicBack, bloodReport, profileImage. Only files that were actually swapped
  // are appended, so existing uploads are never overwritten with empties.
  const form = new FormData();
  form.set("fullName", payload.fullName);
  form.set("phone", payload.phone);
  form.set("email", payload.email ?? "");
  form.set(
    "bloodGroup",
    bloodGroupToBackend(payload.bloodGroup as BloodGroup) ?? payload.bloodGroup
  );
  if (payload.cnicNumber) form.set("cnicNumber", payload.cnicNumber);
  form.set("city", payload.city);
  form.set("area", payload.area);
  if (typeof payload.latitude === "number") form.set("latitude", String(payload.latitude));
  if (typeof payload.longitude === "number") form.set("longitude", String(payload.longitude));
  if (typeof payload.isAvailable === "boolean") {
    form.set("isAvailable", String(payload.isAvailable));
  }
  if (files) {
    if (files.cnicFront instanceof File) form.set("cnicFront", files.cnicFront);
    if (files.cnicBack instanceof File) form.set("cnicBack", files.cnicBack);
    if (files.bloodReport instanceof File) form.set("bloodReport", files.bloodReport);
    if (files.profileImage instanceof File) form.set("profileImage", files.profileImage);
  }
  const body = await request<unknown>("/api/auth/profile", {
    method: "PUT",
    body: form,
  });
  return { donor: toMappedDonor(body) };
}

// ---------------------------------------------------------------------------
// Availability (isAvailable lives on the profile PUT)
// ---------------------------------------------------------------------------

/**
 * Toggles availability. The live backend treats the profile PUT as a partial
 * update, so sending just `{ isAvailable }` is safe and preserves the rest of
 * the donor's fields.
 */
export async function setAvailability(
  donor: DashboardDonor,
  available: boolean
): Promise<{ donor: Pick<DashboardDonor, "availabilityStatus"> }> {
  const body = await request<unknown>("/api/auth/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isAvailable: available }),
  });
  const mapped = toMappedDonor(body);
  return { donor: { availabilityStatus: mapped.availabilityStatus } };
}

// ---------------------------------------------------------------------------
// Profile picture
// ---------------------------------------------------------------------------

export async function uploadProfileImage(
  file: File
): Promise<{ donor: Pick<DashboardDonor, "profileImageUrl"> }> {
  const form = new FormData();
  form.set("profileImage", file);
  const body = await request<unknown>("/api/auth/profile", {
    method: "PUT",
    body: form,
  });
  const donor = toMappedDonor(body);
  return { donor };
}

// ---------------------------------------------------------------------------
// Documents
// ---------------------------------------------------------------------------

export async function getDocuments(): Promise<{ documents: DonorDocument[] }> {
  // The live backend has no /auth/profile/documents route — its `GET
  // /auth/profile` payload includes `documents[]` directly.
  const body = await request<unknown>("/api/auth/profile");
  const data = unwrapEnvelope(body) as { documents?: unknown[] } | null;
  const rawDocs = Array.isArray(data?.documents) ? data.documents : [];
  return { documents: rawDocs.map((d) => mapBackendDocument(d as Record<string, unknown>)) };
}

/** Maps the backend's file-upload row (`fileUrl`, `status`, …) to `DonorDocument`. */
function mapBackendDocument(d: Record<string, unknown>): DonorDocument {
  const strOr = (v: unknown): string | null => (typeof v === "string" ? v : null);
  return {
    id: strOr(d.id),
    type: typeof d.type === "string" ? d.type : "",
    url: strOr(d.fileUrl) ?? "",
    status: strOr(d.status),
    rejectionReason: strOr(d.rejectionReason),
    uploadedAt: strOr(d.uploadedAt),
    reviewedAt: strOr(d.reviewedAt),
  };
}

export async function uploadDocument(
  field: "cnicFront" | "cnicBack",
  file: File
): Promise<{
  donor: Pick<
    DashboardDonor,
    | "cnicFrontUrl"
    | "cnicBackUrl"
    | "cnicFrontStatus"
    | "cnicBackStatus"
    | "bloodReportUrl"
    | "profileImageUrl"
    | "availabilityStatus"
  >;
}> {
  const form = new FormData();
  form.set(field, file);
  const body = await request<unknown>("/api/auth/profile", {
    method: "PUT",
    body: form,
  });
  const donor = toMappedDonor(body);
  return {
    donor: {
      cnicFrontUrl: field === "cnicFront" ? donor.cnicFrontUrl : null,
      cnicBackUrl: field === "cnicBack" ? donor.cnicBackUrl : null,
      cnicFrontStatus: field === "cnicFront" ? donor.cnicFrontStatus : null,
      cnicBackStatus: field === "cnicBack" ? donor.cnicBackStatus : null,
      bloodReportUrl: donor.bloodReportUrl,
      profileImageUrl: donor.profileImageUrl,
      availabilityStatus: donor.availabilityStatus ?? "unavailable",
    },
  };
}

/**
 * The blood-group report uploads through the same multipart profile PUT,
 * stored by the backend as a blood-test report (surfaced again by
 * `GET /auth/profile` as `bloodTestReports`).
 */
export async function uploadBloodReport(file: File): Promise<{
  donor: Pick<
    DashboardDonor,
    | "cnicFrontUrl"
    | "cnicBackUrl"
    | "cnicFrontStatus"
    | "cnicBackStatus"
    | "bloodReportUrl"
    | "profileImageUrl"
    | "availabilityStatus"
  >;
}> {
  const form = new FormData();
  form.set("bloodReport", file);
  const body = await request<unknown>("/api/auth/profile", {
    method: "PUT",
    body: form,
  });
  const donor = toMappedDonor(body);
  return {
    donor: {
      cnicFrontUrl: donor.cnicFrontUrl,
      cnicBackUrl: donor.cnicBackUrl,
      cnicFrontStatus: donor.cnicFrontStatus,
      cnicBackStatus: donor.cnicBackStatus,
      bloodReportUrl: donor.bloodReportUrl,
      profileImageUrl: donor.profileImageUrl,
      availabilityStatus: donor.availabilityStatus ?? "unavailable",
    },
  };
}



// ---------------------------------------------------------------------------
// Email verification
// ---------------------------------------------------------------------------

export interface VerifyEmailPayload {
  email: string;
  otp: string;
}

export async function verifyEmail(
  payload: VerifyEmailPayload
): Promise<{ success: boolean; message?: string }> {
  const body = await request<{ success?: boolean; message?: string }>(
    "/api/auth/verify-email",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  return { success: body?.success ?? true, message: body?.message };
}

export async function resendVerification(
  email: string
): Promise<{ success: boolean; message?: string }> {
  const body = await request<{ success?: boolean; message?: string }>(
    "/api/auth/resend-verification",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }
  );
  return { success: body?.success ?? true, message: body?.message };
}

// ---------------------------------------------------------------------------
// Search (Find a Donor)
// ---------------------------------------------------------------------------

/** A row as returned by `GET /api/v1/donors`. Email is never mapped into the
 *  public result shape; phone is mapped so the requester can call the donor,
 *  but the UI only surfaces it after a request is sent. */
interface BackendDonorRow {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  bloodGroup: string;
  city: string;
  area: string;
  isAvailable: boolean;
  isVerified: boolean;
  totalDonations: number;
  lastDonationDate: string | null;
  createdAt: string;
}

/** Maps one backend donor row to the search page's card shape. */
function mapBackendDonorResult(d: BackendDonorRow): DonorSearchResult {
  return {
    id: d.id,
    name: d.fullName ?? "",
    // Backend sends the enum form ("A_NEGATIVE"); convert to display form
    // ("A-") so it matches the page's filter buttons.
    bloodGroup: bloodGroupFromBackend(d.bloodGroup) ?? (d.bloodGroup as BloodGroup),
    city: d.city ?? "",
    area: d.area ?? "",
    latitude: null,
    longitude: null,
    lastDonationDate: typeof d.lastDonationDate === "string" ? d.lastDonationDate : null,
    isAvailable: typeof d.isAvailable === "boolean" ? d.isAvailable : false,
    isVerified: typeof d.isVerified === "boolean" ? d.isVerified : false,
    distanceKm: null,
    phone: typeof d.phone === "string" && d.phone.trim() ? d.phone : null,
  };
}

export async function getDonorList(
  params: string | URLSearchParams,
  opts?: { signal?: AbortSignal }
): Promise<DonorSearchResponse> {
  const qs = params instanceof URLSearchParams ? params.toString() : params;
  const res = await authFetch(`/api/donors?${qs}`, {
    signal: opts?.signal,
    cache: "no-store",
  });
  if (!res.ok) {
    let body: unknown = null;
    try {
      body = await res.json();
    } catch {
      // no body
    }
    const { message } = errorMessage(body, res.status);
    throw new ApiError(message, res.status);
  }
  const body = (await res.json()) as {
    success?: boolean;
    data?: BackendDonorRow[];
    pagination?: DonorPagination;
  };
  const rows = Array.isArray(body?.data) ? body.data : [];
  const pagination: DonorPagination = body?.pagination ?? {
    page: 1,
    limit: rows.length || 20,
    total: rows.length,
    totalPages: rows.length ? 1 : 0,
  };
  return { donors: rows.map(mapBackendDonorResult), pagination };
}

// ---------------------------------------------------------------------------
// Password change
// ---------------------------------------------------------------------------

/**
 * Changes the logged-in donor's password through the profile PUT. The backend
 * requires `currentPassword` and `newPassword` together (multipart/form-data)
 * and verifies the current password before re-hashing; other profile fields
 * are left untouched.
 */
export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const form = new FormData();
  form.set("currentPassword", currentPassword);
  form.set("newPassword", newPassword);
  await request("/api/auth/profile", {
    method: "PUT",
    body: form,
  });
}