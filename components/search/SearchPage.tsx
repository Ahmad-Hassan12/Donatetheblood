"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import dynamic from "next/dynamic";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import {
  Droplet,
  List as ListIcon,
  Map as MapIcon,
  Search,
  SlidersHorizontal,
  TriangleAlert,
  X,
} from "lucide-react";
import SearchFilters from "@/components/search/SearchFilters";
import DonorListView from "@/components/search/DonorListView";
import EmptyState from "@/components/search/EmptyState";
import SkeletonCard from "@/components/search/SkeletonCard";
import type {
  DonorFilters,
  DonorPagination,
  DonorSearchResult,
  RadiusKm,
} from "@/lib/search-types";
import { getDonorList } from "@/lib/app-api";
import { bloodGroupToBackend } from "@/lib/blood-group-map";
import { distanceKm, donorPlace, geocodePlace } from "@/lib/geo";

const DonorMapView = dynamic(
  () => import("@/components/search/DonorMapView"),
  { ssr: false, loading: () => <MapFallback /> }
);

const ZOOM_FOR_RADIUS: Record<RadiusKm, number> = { 5: 13, 10: 12, 25: 11 };

const DEFAULT_LOCATION_TEXT = "";

/**
 * Client-side match for filters the backend doesn't apply yet. The API only
 * filters by `bloodGroup` server-side, so location and radius are resolved
 * here:
 *
 * - With a search-center coordinate (geolocation, or a place the geocoder
 *   pinned) donors are matched by distance within `radiusKm`.
 * - When the center is missing (the typed location couldn't be pinned on the
 *   map) the location label is matched against city OR area instead.
 * - A typed label that text-matches donors takes precedence over the radius
 *   pass: short area names like "chenab garden" can geocode ambiguously (to a
 *   spot 150 km away), and radius must not turn a valid text match into a
 *   false "no matches". Geolocation labels never text-match donor city/area,
 *   so that path stays a pure distance/radius filter.
 *
 * Query params for each filter are still built in `runSearch`, so this
 * filtering can move server-side later without restructuring.
 */
async function filterResults(
  donors: DonorSearchResult[],
  f: DonorFilters
): Promise<DonorSearchResult[]> {
  let results = donors;
  if (f.bloodGroup) {
    const group = f.bloodGroup;
    results = results.filter((d) => d.bloodGroup === group);
  }
  const location = f.locationLabel.trim().toLowerCase();
  const textMatches = location
    ? results.filter(
        (d) =>
          d.city.toLowerCase().includes(location) ||
          d.area.toLowerCase().includes(location)
      )
    : [];
  const hasCenter =
    f.latitude !== null &&
    f.longitude !== null &&
    !Number.isNaN(f.latitude) &&
    !Number.isNaN(f.longitude);
  if (!hasCenter || f.latitude === null || f.longitude === null) {
    return textMatches.length > 0 ? textMatches : results;
  }
  const radiusMatches = await filterByRadius(results, f, f.latitude, f.longitude);
  if (textMatches.length > 0) {
    const inRadius = radiusMatches.filter((d) =>
      textMatches.some((t) => t.id === d.id)
    );
    return inRadius.length > 0 ? inRadius : textMatches;
  }
  return radiusMatches;
}

/**
 * Keeps donors whose home place falls inside `radiusKm` of the search center.
 * Places are geocoded once per distinct place (cached in `lib/geo`). A donor
 * whose place can't be geocoded is kept, so a geocoder hiccup never silently
 * drops someone genuinely in range.
 */
async function filterByRadius(
  donors: DonorSearchResult[],
  f: DonorFilters,
  centerLat: number,
  centerLng: number
): Promise<DonorSearchResult[]> {
  const byPlace = new Map<string, DonorSearchResult[]>();
  for (const donor of donors) {
    const place = donorPlace(donor);
    const list = byPlace.get(place) ?? [];
    list.push(donor);
    byPlace.set(place, list);
  }
  const kept: DonorSearchResult[] = [];
  for (const [place, list] of byPlace) {
    const point = await geocodePlace(place);
    let distance: number | null = null;
    if (point) {
      distance = distanceKm(
        { latitude: centerLat, longitude: centerLng },
        point
      );
    }
    if (distance === null || distance <= f.radiusKm) {
      for (const donor of list) {
        kept.push(distance === null ? donor : { ...donor, distanceKm: distance });
      }
    }
  }
  kept.sort(
    (a, b) =>
      (a.distanceKm ?? Number.POSITIVE_INFINITY) -
      (b.distanceKm ?? Number.POSITIVE_INFINITY)
  );
  return kept;
}

function MapFallback() {
  return (
    <div
      aria-hidden="true"
      className="grid h-full w-full place-items-center animate-pulse bg-smoke"
    >
      <div className="flex flex-col items-center gap-3 text-mute">
        <MapIcon size={28} />
        <span className="text-sm">Loading map…</span>
      </div>
    </div>
  );
}

export default function SearchPage() {
  const reduce = useReducedMotion();

  const [filters, setFilters] = useState<DonorFilters>({
    bloodGroup: null,
    latitude: null,
    longitude: null,
    locationLabel: DEFAULT_LOCATION_TEXT,
    radiusKm: 10,
  });
  const [locationText, setLocationText] = useState(DEFAULT_LOCATION_TEXT);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [donors, setDonors] = useState<DonorSearchResult[]>([]);
  const [pagination, setPagination] = useState<DonorPagination | null>(null);
  const [locating, setLocating] = useState(false);
  const [geoNotice, setGeoNotice] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "map">("list");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filtersFollowing, setFiltersFollowing] = useState(false);

  const filtersRef = useRef(filters);
  const mobileBarRef = useRef<HTMLDivElement>(null);
  const filterPanelRef = useRef<HTMLElement>(null);
  const seqRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  const setFiltersBoth = useCallback((patch: Partial<DonorFilters>) => {
    const next = { ...filtersRef.current, ...patch };
    filtersRef.current = next;
    setFilters(next);
  }, []);

  const runSearch = useCallback(async () => {
    const seq = ++seqRef.current;
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setStatus("loading");

    const f = filtersRef.current;
    const params = new URLSearchParams();
    if (f.bloodGroup) {
      params.set("bloodGroup", bloodGroupToBackend(f.bloodGroup) ?? f.bloodGroup);
    }
    if (f.latitude !== null && f.longitude !== null) {
      params.set("lat", f.latitude.toString());
      params.set("lng", f.longitude.toString());
    }
    params.set("radiusKm", f.radiusKm.toString());
    if (f.locationLabel) {
      params.set("location", f.locationLabel);
    }
    params.set("page", "1");
    params.set("limit", "20");

    try {
      const data = await getDonorList(params.toString(), { signal: ctrl.signal });
      if (seq !== seqRef.current || ctrl.signal.aborted) return;
      const filtered = await filterResults(data.donors, f);
      if (seq !== seqRef.current || ctrl.signal.aborted) return;
      setDonors(filtered);
      setPagination(data.pagination);
      setStatus("success");
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      if (seq !== seqRef.current) return;
      setStatus("error");
    }
  }, []);

  // Debounced auto-search whenever core filters change. Runs once on page
  // load (no delay) and with a short debounce on every filter change after.
  // Note: latitude/longitude are deliberately left out — location updates
  // (useMyLocation / geocodeAndSearch) trigger runSearch() directly, so
  // including them here would fire a duplicate request on every location change.
  useEffect(() => {
    const firstRun = !hasRun.current;
    hasRun.current = true;
    const t = setTimeout(() => void runSearch(), firstRun ? 0 : 450);
    return () => clearTimeout(t);
  }, [filters.bloodGroup, filters.radiusKm, runSearch]);

  // Keeps the filter tab pinned to the top once the on-page filters have been
  // pushed off the sticky offset (which happens near the bottom of the page):
  // a fixed compact copy of the tab takes over so the search controls stay
  // reachable for the whole scroll.
  useEffect(() => {
    if (typeof window === "undefined") return;
    let raf = 0;
    const update = () => {
      raf = 0;
      let pinned = false;
      const mobileBar = mobileBarRef.current;
      if (mobileBar && mobileBar.offsetParent !== null) {
        pinned = mobileBar.getBoundingClientRect().top < 52;
      }
      if (!pinned) {
        const panel = filterPanelRef.current;
        if (panel && panel.offsetParent !== null) {
          pinned = panel.getBoundingClientRect().top < 84;
        }
      }
      setFiltersFollowing((prev) => (prev === pinned ? prev : pinned));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const useMyLocation = useCallback(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setGeoNotice(
        "Geolocation isn't supported in this browser — type your city or area instead."
      );
      return;
    }
    setLocating(true);
    setGeoNotice(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        let label = `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
            { headers: { Accept: "application/json" } }
          );
          if (res.ok) {
            const geo = (await res.json()) as {
              address?: { city?: string; town?: string; village?: string; suburb?: string; state?: string; country?: string };
            };
            const a = geo.address ?? {};
            const parts = [a.city || a.town || a.village || a.suburb, a.state, a.country].filter(Boolean);
            if (parts.length) label = parts.slice(0, 2).join(", ");
          }
        } catch {
          // keep the raw coordinates as the label
        }
        setLocationText(label);
        setFiltersBoth({ latitude, longitude, locationLabel: label });
        setLocating(false);
        void runSearch();
      },
      (err) => {
        setLocating(false);
        setGeoNotice(
          err && err.code === 1
            ? "Location permission denied — type your city or area instead."
            : "Couldn't detect your location — type your city or area instead."
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, [runSearch, setFiltersBoth]);

  const geocodeAndSearch = useCallback(
    async (text: string) => {
      const query = text.trim();
      if (!query) return;
      setLocating(true);
      setGeoNotice(null);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`,
          { headers: { Accept: "application/json" } }
        );
        if (res.ok) {
          const hits = (await res.json()) as {
            lat: string;
            lon: string;
          }[];
          if (hits.length) {
            setFiltersBoth({
              latitude: Number(hits[0].lat),
              longitude: Number(hits[0].lon),
              locationLabel: query,
            });
            void runSearch();
            return;
          }
        }
        setFiltersBoth({ latitude: null, longitude: null, locationLabel: query });
        setGeoNotice(
          "Couldn't pin that area on the map — showing donors for that city name instead."
        );
        void runSearch();
      } catch {
        setFiltersBoth({ latitude: null, longitude: null, locationLabel: query });
      } finally {
        setLocating(false);
      }
    },
    [runSearch, setFiltersBoth]
  );

  const handleSearch = useCallback(() => {
    const text = locationText.trim();
    const currentLabel = filtersRef.current.locationLabel.trim();
    const hasCoords =
      filtersRef.current.latitude !== null &&
      filtersRef.current.longitude !== null;
    // If the user typed a new place that differs from the label we already
    // have coordinates for, geocode it first — otherwise runSearch would
    // search the stale coordinates.
    if (text && (!hasCoords || text !== currentLabel)) {
      void geocodeAndSearch(text);
    } else {
      void runSearch();
    }
  }, [geocodeAndSearch, locationText, runSearch]);

  const expandRadius = useCallback(() => {
    setFiltersBoth({ radiusKm: 25 });
  }, [setFiltersBoth]);

  const hasCoords =
    filters.latitude !== null && filters.longitude !== null;
  const mapCenter = useMemo(
    () =>
      hasCoords && filters.latitude !== null && filters.longitude !== null
        ? { latitude: filters.latitude, longitude: filters.longitude }
        : null,
    [filters.latitude, filters.longitude, hasCoords]
  );

  return (
    <>
      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-24 sm:px-6 lg:px-10 lg:pt-28">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-ink font-display md:text-4xl">
            Find a donor near you
          </h1>
          <p className="mt-2 text-[15px] leading-relaxed text-mute">
            Search verified donors by blood group and location. Contact details
            are only shared after you send a request — never listed publicly.
          </p>
        </div>

        {/* Mobile: compact filter bar */}
        <div
          ref={mobileBarRef}
          className="sticky top-16 z-40 mt-5 -mx-4 flex items-center gap-2 px-4 sm:mx-0 sm:px-0 lg:hidden"
        >
          <div className="flex w-full items-center gap-2 overflow-x-auto rounded-full border border-fog bg-white/95 py-1.5 pl-2 pr-1.5 text-xs font-medium text-ink shadow-sm backdrop-blur">
            <Chip>{filters.bloodGroup ?? "Any group"}</Chip>
            <Chip>{filters.locationLabel || "Anywhere"}</Chip>
            <Chip>{filters.radiusKm} km</Chip>
          </div>
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-ink px-4 text-sm font-semibold text-white"
          >
            <SlidersHorizontal size={15} />
            Filters
          </button>
        </div>

        {/* Desktop: full filter panel */}
        <section
          ref={filterPanelRef}
          aria-label="Search filters"
          className="mt-6 hidden rounded-2xl border border-fog bg-white p-5 shadow-sm lg:sticky lg:top-24 lg:z-30 lg:mt-8 lg:block"
        >
          <SearchFilters
            filters={filters}
            locationText={locationText}
            locating={locating}
            geoNotice={geoNotice}
            onChange={(patch) => {
              setFiltersBoth(patch);
              if (patch.latitude !== undefined || patch.longitude !== undefined) {
                setGeoNotice(null);
              }
            }}
            onLocationTextChange={setLocationText}
            onUseMyLocation={useMyLocation}
            onSearch={handleSearch}
          />
          <p className="mt-4 text-xs text-mute">
            Results update automatically as you change filters. Donor contact
            stays private until you request it.
          </p>
        </section>

        {/* Results */}
        <div className="mt-6 lg:grid lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-6">
          {/* Mobile list/map toggle */}
          <div
            role="tablist"
            aria-label="Results view"
            className="mb-3 grid grid-cols-2 gap-1 rounded-full border border-fog bg-smoke p-1 lg:hidden"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mobileView === "list"}
              onClick={() => setMobileView("list")}
              className={
                mobileView === "list"
                  ? "inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-white text-sm font-semibold text-ink shadow-sm"
                  : "inline-flex h-9 items-center justify-center gap-1.5 rounded-full text-sm font-medium text-mute"
              }
            >
              <ListIcon size={15} />
              List
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mobileView === "map"}
              onClick={() => setMobileView("map")}
              className={
                mobileView === "map"
                  ? "inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-white text-sm font-semibold text-ink shadow-sm"
                  : "inline-flex h-9 items-center justify-center gap-1.5 rounded-full text-sm font-medium text-mute"
              }
            >
              <MapIcon size={15} />
              Map
            </button>
          </div>

          {/* List column */}
          <section
            aria-label="Donor list"
            className={
              mobileView === "map"
                ? "hidden lg:block lg:max-h-[calc(100vh-11rem)] lg:overflow-y-auto lg:pr-1"
                : "space-y-3 lg:max-h-[calc(100vh-11rem)] lg:overflow-y-auto lg:pr-1"
            }
          >
            {status === "idle" && (
              <EmptyState
                title="Search to find donors nearby"
                description="Pick a blood group, then add a city or use your current location to see who's available nearby."
              />
            )}

            {status === "loading" && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-ink">
                  Searching the donor directory…
                </p>
                {Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            )}

            {status === "error" && (
              <EmptyState
                icon={<TriangleAlert size={28} strokeWidth={1.6} />}
                title="Search failed"
                description="We couldn't reach the donor directory. Check your connection and try again."
                actionLabel="Retry"
                onAction={() => void runSearch()}
              />
            )}

            {status === "success" && donors.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-medium uppercase tracking-wide text-mute">
                  {pagination
                    ? `${pagination.total} match${pagination.total === 1 ? "" : "es"} found`
                    : `${donors.length} donor${donors.length === 1 ? "" : "s"} showing`}
                </p>
                <DonorListView donors={donors} />
              </div>
            )}

            {status === "success" && donors.length === 0 && (
              <EmptyState
                title="No donor registered yet"
                description={
                  filters.locationLabel.length > 0
                    ? `No donor is registered in ${filters.locationLabel} yet. When a donor registers here, they'll show up in this list.`
                    : "No donor is registered yet. When a donor registers, they'll show up here."
                }
                actionLabel={
                  filters.radiusKm < 25 ? "Expand radius to 25 km" : undefined
                }
                onAction={filters.radiusKm < 25 ? expandRadius : undefined}
              />
            )}
          </section>

          {/* Map column */}
          <section
            data-lenis-prevent
            aria-label="Donor map"
            className={
              mobileView === "list"
                ? "relative mt-6 hidden h-[62vh] overflow-hidden rounded-2xl border border-fog lg:sticky lg:top-20 lg:mt-0 lg:block lg:h-[calc(100vh-13rem)]"
                : "relative mt-6 block h-[62vh] overflow-hidden rounded-2xl border border-fog lg:sticky lg:top-20 lg:mt-0 lg:h-[calc(100vh-13rem)]"
            }
          >
            {mapCenter ? (
              <DonorMapView
                donors={donors}
                center={mapCenter}
                zoom={ZOOM_FOR_RADIUS[filters.radiusKm]}
                radiusKm={filters.radiusKm}
                locateText={filters.locationLabel}
              />
            ) : (
              <div className="grid h-full w-full place-items-center bg-smoke">
                <div className="flex flex-col items-center gap-3 px-6 text-center text-mute">
                  <Droplet size={30} strokeWidth={1.6} />
                  <p className="max-w-[240px] text-sm leading-relaxed">
                    Add a location or use “Use my location” to see the map with
                    pins.
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Pinned search tab: takes over when the on-page filter bar/panel has
          been scrolled out of view so the search controls stay reachable. */}
      {filtersFollowing && (
        <>
          <div className="fixed inset-x-0 top-16 z-40 border-b border-fog bg-white/95 px-4 py-2 backdrop-blur lg:hidden">
            <div className="flex w-full items-center gap-2">
              <div className="flex w-full items-center gap-2 overflow-x-auto rounded-full border border-fog bg-white py-1.5 pl-2 pr-1.5 text-xs font-medium text-ink shadow-sm">
                <Chip>{filters.bloodGroup ?? "Any group"}</Chip>
                <Chip>{filters.locationLabel || "Anywhere"}</Chip>
                <Chip>{filters.radiusKm} km</Chip>
              </div>
              <button
                type="button"
                onClick={() => setFiltersOpen(true)}
                className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-ink px-4 text-sm font-semibold text-white"
              >
                <SlidersHorizontal size={15} />
                Filters
              </button>
            </div>
          </div>

          <div className="fixed inset-x-0 top-16 z-30 hidden lg:block">
            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-10">
              <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-fog bg-white/95 px-4 py-2.5 shadow-lg backdrop-blur">
                <div className="flex min-w-0 items-center gap-2 overflow-x-auto text-xs font-medium text-ink">
                  <Chip>{filters.bloodGroup ?? "Any group"}</Chip>
                  <Chip>{filters.locationLabel || "Anywhere"}</Chip>
                  <Chip>{filters.radiusKm} km</Chip>
                </div>
                <button
                  type="button"
                  onClick={() => void handleSearch()}
                  className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-blood px-4 text-sm font-semibold text-white"
                >
                  <Search size={14} />
                  Search
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Mobile: filters bottom sheet */}
      <AnimatePresence>
        {filtersOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFiltersOpen(false)}
              className="fixed inset-0 z-[70] bg-black/40 lg:hidden"
            />
            <motion.div
              key="sheet"
              initial={reduce ? { y: 0 } : { y: "100%" }}
              animate={{ y: 0 }}
              exit={reduce ? { y: 0 } : { y: "100%" }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-x-0 bottom-0 z-[80] rounded-t-3xl border-t border-fog bg-white lg:hidden"
            >
              <div
                data-lenis-prevent
                className="max-h-[85vh] overflow-y-auto p-5 pb-8"
              >
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-ink">Filters</h2>
                  <button
                    type="button"
                    aria-label="Close filters"
                    onClick={() => setFiltersOpen(false)}
                    className="grid h-9 w-9 place-items-center rounded-full text-mute transition-colors hover:bg-smoke hover:text-ink"
                  >
                    <X size={18} />
                  </button>
                </div>

                <SearchFilters
                  filters={filters}
                  locationText={locationText}
                  locating={locating}
                  geoNotice={geoNotice}
                  onChange={(patch) => {
                    setFiltersBoth(patch);
                    if (patch.latitude !== undefined || patch.longitude !== undefined) {
                      setGeoNotice(null);
                    }
                  }}
                  onLocationTextChange={setLocationText}
                  onUseMyLocation={useMyLocation}
                  onSearch={() => {
                    handleSearch();
                    setFiltersOpen(false);
                  }}
                />

                <button
                  type="button"
                  onClick={() => setFiltersOpen(false)}
                  className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-blood text-sm font-semibold text-white shadow-[0_10px_24px_-10px_rgba(217,28,43,0.8)]"
                >
                  <Search size={16} />
                  Show results
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="shrink-0 rounded-full bg-smoke px-3 py-1.5 text-xs font-medium text-ink/80">
      {children}
    </span>
  );
}