"use client";

import { useState } from "react";
import { AlertCircle, HeartHandshake, Loader2, ToggleLeft, ToggleRight } from "lucide-react";
import { isProfileComplete, setAvailability } from "@/lib/app-api";
import type { DashboardDonor } from "@/lib/app-api";

interface AvailabilityCardProps {
  donor: DashboardDonor;
  notify: (message: string, kind: "success" | "error") => void;
  onChanged: (availabilityStatus: string) => void;
}

export default function AvailabilityCard({
  donor,
  notify,
  onChanged,
}: AvailabilityCardProps) {
  const [busy, setBusy] = useState(false);
  const complete = isProfileComplete(donor);
  const available = donor.availabilityStatus === "available";

  async function toggle() {
    setBusy(true);
    try {
      const { donor: updated } = await setAvailability(donor, !available);
      onChanged(updated.availabilityStatus);
      notify(
        updated.availabilityStatus === "available"
          ? "You're now available for donation requests."
          : "Availability turned off.",
        "success"
      );
    } catch (err) {
      notify(
        err instanceof Error ? err.message : "Could not update availability.",
        "error"
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-3xl border border-line bg-card p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-blood/10 text-blood">
          <HeartHandshake size={20} />
        </span>
        <div>
          <h2 className="font-display text-xl font-bold text-ink">
            Available for donation?
          </h2>
          <p className="mt-0.5 text-sm text-mute">
            When this is ON, you appear in Find a Donor near the patients who
            need your blood group.
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-line bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink">
              {available ? "You're listed as available" : "You're not listed"}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-mute">
              {complete
                ? available
                  ? "Patients searching by your blood group, city and area can see you."
                  : "Turn it on any time — patients can then find you in search results."
                : "Finish your profile first. Upload CNIC front, CNIC back and your blood-group report, fill every field, then click “Save changes” to unlock this switch."}
            </p>
          </div>

          <button
            type="button"
            disabled={busy || !complete}
            onClick={() => void toggle()}
            aria-pressed={available}
            className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              complete
                ? available
                  ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                  : "bg-red-100 text-red-700 hover:bg-red-200"
                : "bg-smoke text-mute"
            }`}
          >
            {busy ? (
              <Loader2 size={15} className="animate-spin" />
            ) : available ? (
              <ToggleRight size={17} />
            ) : (
              <ToggleLeft size={17} />
            )}
            {available ? "On" : "Off"}
          </button>
        </div>

        {!complete && (
          <p className="mt-3 flex items-start gap-1.5 text-xs font-medium text-amber-700">
            <AlertCircle size={13} className="mt-0.5 shrink-0" />
            This switch unlocks once your profile is complete and saved — all
            three documents uploaded and every required field filled.
          </p>
        )}
      </div>
    </section>
  );
}