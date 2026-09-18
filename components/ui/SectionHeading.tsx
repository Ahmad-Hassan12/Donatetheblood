import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import Reveal from "@/components/ui/Reveal";

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  lede?: ReactNode;
  center?: boolean;
  className?: string;
}

export default function SectionHeading({
  eyebrow,
  title,
  lede,
  center = true,
  className,
}: SectionHeadingProps) {
  return (
    <Reveal
      className={cn(
        "max-w-2xl",
        center && "mx-auto text-center",
        className
      )}
    >
      {eyebrow ? (
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blood">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-3 text-balance font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
        {title}
      </h2>
      {lede ? (
        <p className="mt-4 text-base leading-relaxed text-mute sm:text-lg">
          {lede}
        </p>
      ) : null}
    </Reveal>
  );
}