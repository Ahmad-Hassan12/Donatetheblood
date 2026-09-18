import { Droplet } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
}

export default function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-fog bg-smoke px-6 py-16 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-blood/10 text-blood">
        {icon ?? <Droplet size={30} strokeWidth={1.6} />}
      </div>
      <h2 className="mt-5 text-lg font-semibold text-ink">{title}</h2>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-mute">{description}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-ink px-6 text-sm font-semibold text-white transition-colors hover:bg-black"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}