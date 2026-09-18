"use client";

import { useState } from "react";
import { BadgeCheck, MapPin, Check } from "lucide-react";
import type { DonorSearchResult } from "@/lib/search-types";
import { displayName, formatDistance } from "@/lib/search-utils";
import dynamic from "next/dynamic";

const DonorRequestModal = dynamic(() => import("./DonorRequestModal"), {
  ssr: false,
  loading: () => null,
});

interface DonorResultCardProps {
  donor: DonorSearchResult;
}

export default function DonorResultCard({ donor }: DonorResultCardProps) {
  const [requested, setRequested] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <article className="flex h-full flex-col rounded-2xl border border-fog bg-white p-4 transition-colors hover:border-blood/30">
      <div className="flex items-start gap-3">
        <div
          aria-hidden="true"
          className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-blood text-base font-bold text-white"
        >
          {donor.bloodGroup}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-[15px] font-semibold text-ink">
              {displayName(donor.name)}
            </h3>
            {donor.isVerified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                <BadgeCheck size={13} />
                Verified
              </span>
            )}
          </div>
          <p className="mt-0.5 flex items-center gap-1 truncate text-sm text-mute">
            <MapPin size={13} className="shrink-0" />
            {donor.area}, {donor.city}
          </p>
        </div>

        <p className="shrink-0 text-sm font-medium text-ink/80">
          {donor.distanceKm !== null ? `${formatDistance(donor.distanceKm)} away` : "Nearby"}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-fog pt-3">
        <span className="flex items-center gap-2 text-sm">
          <span
            aria-hidden="true"
            className={donor.isAvailable ? "h-2 w-2 rounded-full bg-emerald-500" : "h-2 w-2 rounded-full bg-mute"}
          />
          <span
            className={donor.isAvailable ? "font-medium text-emerald-700" : "text-mute"}
          >
            {donor.isAvailable ? "Available" : "Not available"}
          </span>
        </span>

        <button
          type="button"
          onClick={() => {
            if (!requested && donor.isAvailable) {
              setModalOpen(true);
            }
          }}
          disabled={requested || !donor.isAvailable}
          className={
            requested
              ? "inline-flex h-9 items-center gap-1.5 rounded-full border border-fog bg-smoke px-4 text-sm font-semibold text-ink/60"
              : donor.isAvailable
                ? "inline-flex h-9 items-center gap-1.5 rounded-full bg-blood px-4 text-sm font-semibold text-white shadow-[0_8px_18px_-8px_rgba(217,28,43,0.7)] transition-colors hover:bg-blood-deep"
                : "inline-flex h-9 items-center gap-1.5 rounded-full border border-fog bg-smoke px-4 text-sm font-semibold text-ink/40"
          }
          aria-live="polite"
        >
          {requested ? (
            <>
              <Check size={15} />
              Requested
            </>
          ) : (
            "Request"
          )}
        </button>
      </div>

      {modalOpen && (
        <DonorRequestModal
          donor={donor}
          onClose={() => {
            setModalOpen(false);
          }}
          onSent={() => {
            setRequested(true);
            setModalOpen(false);
          }}
        />
      )}
    </article>
  );
}
