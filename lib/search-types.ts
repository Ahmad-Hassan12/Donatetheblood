export type BloodGroup = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";

export const BLOOD_GROUPS: BloodGroup[] = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
];

export const RADIUS_OPTIONS = [5, 10, 25] as const;
export type RadiusKm = (typeof RADIUS_OPTIONS)[number];

export interface DonorProfile {
  id: string;
  name: string;
  bloodGroup: BloodGroup;
  city: string;
  area: string;
  latitude: number | null;
  longitude: number | null;
  lastDonationDate: string | null;
}

export interface DonorSearchResult extends DonorProfile {
  isAvailable: boolean;
  isVerified: boolean;
  distanceKm: number | null;
  /** Never rendered by the card; only surfaced inside the request modal, where
   *  the requester can reach the donor via the "Call Now" action. */
  phone: string | null;
}

/**
 * Search is driven by blood group, location and radius; results are always
 * restricted to verified, currently available donors (the `availableOnly=true`
 * flag is sent on every search).
 */
export interface DonorFilters {
  bloodGroup: BloodGroup | null;
  latitude: number | null;
  longitude: number | null;
  locationLabel: string;
  radiusKm: RadiusKm;
}

export interface DonorSearchQuery {
  bloodGroup: string | null;
  lat: number | null;
  lng: number | null;
  radiusKm: RadiusKm;
  availableOnly: boolean;
  location: string;
}

export interface DonorPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Shape returned by the real backend (`GET /api/v1/donors`): the envelope's
 * `data[]` mapped into `DonorSearchResult`s plus the `pagination` block, kept
 * for future "load more" pagination.
 */
export interface DonorSearchResponse {
  donors: DonorSearchResult[];
  pagination: DonorPagination;
}