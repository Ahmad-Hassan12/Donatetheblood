"use client";

import { useEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import MagneticButton from "@/components/ui/MagneticButton";

gsap.registerPlugin(ScrollTrigger);

interface Dot {
  left: number;
  top: number;
  size: number;
  delay: number;
  duration: number;
  kind: "blood" | "white" | "blush";
}

export default function CTABanner() {
  const root = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  const dots = useMemo<Dot[]>(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        left: (i * 37 + 6) % 100,
        top: (i * 53 + 18) % 96,
        size: 3 + (i % 3) * 2,
        delay: (i % 7) * 0.9,
        duration: 7 + (i % 4) * 2.5,
        kind: (["blood", "white", "blush"] as const)[i % 3],
      })),
    []
  );

  useEffect(() => {
    if (reduce) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".cta-glow",
        { scale: 0.82 },
        {
          scale: 1.18,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    }, root);
    return () => ctx.revert();
  }, [reduce]);

  const dotColor = (kind: Dot["kind"]) =>
    kind === "blood"
      ? "bg-blood"
      : kind === "white"
        ? "bg-white"
        : "bg-blood/30";

  return (
    <section
      ref={root}
      id="cta"
      data-bg="dark"
      className="relative flex min-h-[520px] items-center overflow-hidden bg-black py-28 md:py-36"
    >
      <div
        aria-hidden="true"
        className="cta-glow absolute left-1/2 top-1/2 h-[720px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(217,28,43,0.32),transparent_62%)] will-change-transform"
      />

      <div
        aria-hidden="true"
        className="animate-rotate-slow absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-blood/25"
      />

      {!reduce &&
        dots.map((dot, i) => (
          <span
            key={i}
            className={`animate-float-dot pointer-events-none absolute rounded-full ${dotColor(dot.kind)}`}
            style={{
              left: `${dot.left}%`,
              top: `${dot.top}%`,
              width: dot.size,
              height: dot.size,
              animationDelay: `${dot.delay}s`,
              animationDuration: `${dot.duration}s`,
            }}
          />
        ))}

      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center md:px-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-blood">
          Become a donor
        </p>
        <h2 className="mt-5 text-balance font-display text-4xl font-bold leading-tight tracking-tight text-white sm:text-6xl">
          Be someone&apos;s reason to live.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/60 sm:text-lg">
          Tomorrow someone across town might not have one. Register today and you
          could answer a stranger&apos;s most urgent call.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <MagneticButton
            href="/register"
            className="group rounded-full bg-blood px-9 py-4 text-[15px] font-semibold text-white shadow-[0_16px_44px_-12px_rgba(217,28,43,0.8)] hover:bg-blood-deep"
          >
            Become a Donor
            <ArrowRight
              size={17}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </MagneticButton>
        </div>
        <p className="mt-5 text-sm text-white/40">
          Takes five minutes · Free forever · One unit can save up to three lives
        </p>
      </div>
    </section>
  );
}