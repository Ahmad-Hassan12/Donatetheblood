"use client";

import type { ReactNode } from "react";
import {
  Loader2,
  LocateFixed,
  MapPin,
  Search,
  TriangleAlert,
} from "lucide-react";
import type { DonorFilters } from "@/lib/search-types";
import { RADIUS_OPTIONS } from "@/lib/search-types";
import BloodGroupSelector from "@/components/ui/BloodGroupSelector";
import { cn } from "@/lib/cn";

interface SearchFiltersProps {
  filters: DonorFilters;
  locationText: string;
  locating: boolean;
  geoNotice: string | null;
  onChange: (patch: Partial<DonorFilters>) => void;
  onLocationTextChange: (text: string) => void;
  onUseMyLocation: () => void;
  onSearch: () => void;
}

function Label({ children }: { children: ReactNode }) {
  return (
    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink">
      {children}
    </span>
  );
}

export default function SearchFilters({
  filters,
  locationText,
  locating,
  geoNotice,
  onChange,
  onLocationTextChange,
  onUseMyLocation,
  onSearch,
}: SearchFiltersProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSearch();
      }}
      className="space-y-5"
    >
      <div>
        <Label>Blood group</Label>
        <div className="mt-2">
          <BloodGroupSelector
            value={filters.bloodGroup}
            onChange={(group) => onChange({ bloodGroup: group })}
          />
        </div>
      </div>

      <div>
        <Label>Location</Label>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <MapPin
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-mute"
            />
            <input
              type="text"
              value={locationText}
              onChange={(e) => onLocationTextChange(e.target.value)}
              placeholder="City or area"
              autoComplete="off"
              className="h-11 w-full rounded-full border border-ink/15 bg-white pl-10 pr-4 text-sm text-ink outline-none transition-colors duration-150 placeholder:text-mute focus:border-blood"
            />
          </div>
          <button
            type="button"
            onClick={onUseMyLocation}
            disabled={locating}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-ink/15 bg-white px-4 text-sm font-semibold text-ink transition-colors duration-150 hover:border-blood/50 hover:text-blood disabled:opacity-60"
          >
            {locating ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <LocateFixed size={16} />
            )}
            Use my location
          </button>
        </div>
        {geoNotice && (
          <p
            role="status"
            className="mt-2 flex items-start gap-1.5 text-xs leading-relaxed text-blood/90"
          >
            <TriangleAlert size={13} className="mt-0.5 shrink-0" />
            {geoNotice}
          </p>
        )}
      </div>

      <div>
        <Label>Radius</Label>
        <div className="mt-2 grid grid-cols-3 gap-1 rounded-full border border-fog bg-smoke p-1">
          {RADIUS_OPTIONS.map((radius) => {
            const active = filters.radiusKm === radius;
            return (
              <button
                key={radius}
                type="button"
                aria-pressed={active}
                onClick={() => onChange({ radiusKm: radius })}
                className={cn(
                  "h-9 rounded-full text-sm font-semibold transition-colors duration-150 active:scale-[0.97]",
                  active
                    ? "bg-ink text-white shadow-sm"
                    : "text-mute hover:text-ink"
                )}
              >
                {radius} km
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-blood px-7 text-sm font-semibold text-white shadow-[0_10px_24px_-10px_rgba(217,28,43,0.8)] transition-colors duration-150 hover:bg-blood-deep"
        >
          <Search size={16} />
          Search
        </button>
      </div>
    </form>
  );
}