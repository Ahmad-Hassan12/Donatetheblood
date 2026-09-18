"use client";

import { useCallback, useState } from "react";
import { Loader2, LocateFixed } from "lucide-react";
import { cn } from "@/lib/cn";

export interface LocatedPlace {
  latitude: number;
  longitude: number;
  label: string;
}

interface UseLocationButtonProps {
  onLocated: (place: LocatedPlace) => void;
  onNotice?: (message: string | null) => void;
  className?: string;
  compact?: boolean;
}

export default function UseLocationButton({
  onLocated,
  onNotice,
  className,
  compact,
}: UseLocationButtonProps) {
  const [busy, setBusy] = useState(false);

  const handle = useCallback(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      onNotice?.(
        "Geolocation isn't supported in this browser — write your city or area instead."
      );
      return;
    }
    setBusy(true);
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
              address?: {
                city?: string;
                town?: string;
                village?: string;
                suburb?: string;
                state?: string;
                country?: string;
              };
            };
            const a = geo.address ?? {};
            const parts = [
              a.city || a.town || a.village || a.suburb,
              a.state,
              a.country,
            ].filter(Boolean);
            if (parts.length) label = parts.slice(0, 2).join(", ");
          }
        } catch {
          // fall back to coordinates as the label
        }
        setBusy(false);
        onLocated({ latitude, longitude, label });
      },
      (err) => {
        setBusy(false);
        onNotice?.(
          err && err.code === 1
            ? "Location permission denied — write your city or area instead."
            : "Couldn't detect your location — write your city or area instead."
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, [onLocated, onNotice]);

  return (
    <button
      type="button"
      onClick={handle}
      disabled={busy}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full border border-ink/15 bg-white font-semibold text-ink transition-colors duration-150 hover:border-blood/50 hover:text-blood disabled:opacity-60",
        compact ? "h-9 px-3.5 text-xs" : "h-11 px-4 text-sm",
        className
      )}
    >
      {busy ? <Loader2 size={compact ? 14 : 16} className="animate-spin" /> : <LocateFixed size={compact ? 14 : 16} />}
      Use my location
    </button>
  );
}