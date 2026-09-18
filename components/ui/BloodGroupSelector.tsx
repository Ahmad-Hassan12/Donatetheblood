"use client";

import type { BloodGroup } from "@/lib/search-types";
import { BLOOD_GROUPS } from "@/lib/search-types";
import { cn } from "@/lib/cn";

interface BloodGroupSelectorProps {
  value: BloodGroup | null;
  onChange: (group: BloodGroup | null) => void;
  allowClear?: boolean;
}

export default function BloodGroupSelector({
  value,
  onChange,
  allowClear = true,
}: BloodGroupSelectorProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {BLOOD_GROUPS.map((group) => {
        const active = value === group;
        return (
          <button
            key={group}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(active && allowClear ? null : group)}
            className={cn(
              "h-11 rounded-full text-sm font-bold transition-all duration-150 active:scale-[0.96]",
              active
                ? "bg-blood text-white shadow-[0_8px_16px_-8px_rgba(217,28,43,0.8)]"
                : "border border-ink/15 bg-white text-ink/70 hover:border-blood/50 hover:text-blood"
            )}
          >
            {group}
          </button>
        );
      })}
    </div>
  );
}