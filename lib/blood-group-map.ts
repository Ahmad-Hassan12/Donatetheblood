import type { BloodGroup } from "@/lib/search-types";

/**
 * Blood-group enums differ between this frontend ("O+", "A-", "AB+", ...)
 * and the Node.js backend ("O_POSITIVE", "A_NEGATIVE", "AB_POSITIVE", ...).
 * These helpers convert between the two spellings.
 */

const BACKEND_FORM: Record<BloodGroup, string> = {
  "A+": "A_POSITIVE",
  "A-": "A_NEGATIVE",
  "B+": "B_POSITIVE",
  "B-": "B_NEGATIVE",
  "AB+": "AB_POSITIVE",
  "AB-": "AB_NEGATIVE",
  "O+": "O_POSITIVE",
  "O-": "O_NEGATIVE",
};

const FRONTEND_FORM = Object.fromEntries(
  Object.entries(BACKEND_FORM).map(([frontend, backend]) => [backend, frontend])
) as Record<string, BloodGroup>;

/** "O+" -> "O_POSITIVE" (returns undefined for unknown groups). */
export function bloodGroupToBackend(group: BloodGroup | null | undefined): string | undefined {
  return group ? BACKEND_FORM[group] : undefined;
}

/** "O_POSITIVE" -> "O+" (returns "O+"-style original if unknown). */
export function bloodGroupFromBackend(group: string | null | undefined): BloodGroup | null {
  if (!group) return null;
  return FRONTEND_FORM[group] ?? null;
}