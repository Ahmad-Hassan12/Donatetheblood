/**
 * Geolocation helpers shared by the Find a Donor search page and map.
 *
 * The donor-search API doesn't return donor coordinates (only the donor
 * detail route does), but every donor has a home area/city. These helpers
 * resolve those places to points with the same Nominatim geocoder the search
 * and map already use, and cache the result so repeat searches — or the map
 * re-rendering after a radius change — never re-hit the geocoder.
 */

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

const GEO_CACHE = new Map<string, GeoPoint>();
export { GEO_CACHE };

/** Resolves a place query ("area, city") to a coordinate point. Cached. */
export async function geocodePlace(query: string): Promise<GeoPoint | null> {
  const trimmed = query.trim();
  if (!trimmed) return null;
  const cached = GEO_CACHE.get(trimmed);
  if (cached) return cached;
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(trimmed)}`,
      { headers: { Accept: "application/json" } }
    );
    if (res.ok) {
      const hits = (await res.json()) as { lat: string; lon: string }[];
      const hit = hits[0];
      if (hit) {
        const point = { latitude: Number(hit.lat), longitude: Number(hit.lon) };
        GEO_CACHE.set(trimmed, point);
        return point;
      }
    }
  } catch {
    // geocoder unreachable — callers treat a miss conservatively
  }
  return null;
}

/** Great-circle distance in kilometres between two points (haversine). */
export function distanceKm(
  a: GeoPoint,
  b: GeoPoint
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const s =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(a.latitude)) *
      Math.cos(toRad(b.latitude)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return 2 * R * Math.asin(Math.sqrt(s));
}

/** Human label for a donor's home place, used to geocode it for distance. */
export function donorPlace(donor: { area: string; city: string }): string {
  return [donor.area, donor.city]
    .map((s) => (s ?? "").trim())
    .filter(Boolean)
    .join(", ");
}