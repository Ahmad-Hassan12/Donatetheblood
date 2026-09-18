import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

interface FeatureCardProps {
  icon: LucideIcon;
  title: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function FeatureCard({
  icon: Icon,
  title,
  children,
  className,
}: FeatureCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-fog bg-white p-6",
        className
      )}
    >
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-blush text-blood">
        <Icon size={20} strokeWidth={1.9} />
      </span>
      <h3 className="mt-4 font-display text-lg font-bold tracking-tight text-ink">
        {title}
      </h3>
      <p className="mt-2 text-[15px] leading-relaxed text-mute">{children}</p>
    </div>
  );
}