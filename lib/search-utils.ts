/** "just now", "5 minutes ago", "3 days ago" — for alert timestamps. */
export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diffMs = Date.now() - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 14) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "short" }).format(then);
}

/** "3.2 km" under 10km, "12 km" above; "850 m" for sub-kilometre spots. */
export function formatDistance(km: number | null): string {
  if (km === null || Number.isNaN(km)) return "Distance unknown";
  if (km < 1) return `${Math.max(1, Math.round(km * 1000))} m`;
  return `${km.toFixed(1)} km`;
}

/** Short privacy-safe label: "Ayesha K." */
export function displayName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  const first = parts[0] ?? fullName;
  const lastInitial = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return lastInitial ? `${first} ${lastInitial}.` : first;
}