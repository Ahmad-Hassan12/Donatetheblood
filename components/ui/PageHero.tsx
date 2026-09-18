import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import Reveal from "@/components/ui/Reveal";

interface PageHeroProps {
  eyebrow: string;
  title: ReactNode;
  subtitle?: ReactNode;
  className?: string;
}

export default function PageHero({
  eyebrow,
  title,
  subtitle,
  className,
}: PageHeroProps) {
  return (
    <Reveal className={cn("mx-auto max-w-2xl text-center", className)}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blood">
        {eyebrow}
      </p>
      <h1 className="mt-4 text-balance font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
        {title}
      </h1>
      {subtitle ? (
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-mute sm:text-lg">
          {subtitle}
        </p>
      ) : null}
    </Reveal>
  );
}