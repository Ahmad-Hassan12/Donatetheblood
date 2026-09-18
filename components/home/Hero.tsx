"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import type { MouseEvent as ReactMouseEvent } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, HeartPulse } from "lucide-react";
import DropGlyph from "@/components/ui/DropGlyph";
import MagneticButton from "@/components/ui/MagneticButton";

gsap.registerPlugin(ScrollTrigger);

const HeroScene = dynamic(() => import("./HeroScene"), {
  ssr: false,
  loading: () => null,
});

const EASE = [0.22, 1, 0.36, 1] as const;

const SCENE_QUERY =
  "(pointer: fine) and (min-width: 768px) and (prefers-reduced-motion: no-preference)";

function useSceneKind(): "3d" | "2d" {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(SCENE_QUERY);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => (window.matchMedia(SCENE_QUERY).matches ? "3d" : "2d"),
    () => "2d"
  );
}

function MaskLine({
  children,
  delay,
  reduce,
}: {
  children: React.ReactNode;
  delay: number;
  reduce: boolean | null;
}) {
  return (
    <span className="-mb-[0.1em] block overflow-hidden pb-[0.1em]">
      <motion.span
        className="block will-change-transform"
        initial={reduce ? false : { y: "115%" }}
        animate={{ y: "0%" }}
        transition={{ duration: 0.9, delay, ease: EASE }}
      >
        {children}
      </motion.span>
    </span>
  );
}

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const scrollRef = useRef<number>(0);
  const pointerRef = useRef({ x: 0, y: 0 });
  const reduce = useReducedMotion();
  const scene = useSceneKind();

  useEffect(() => {
    if (reduce) return;
    const ctx = gsap.context(() => {
      const trigger = {
        trigger: root.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
      };

      gsap.to(".hero-parallax-copy", {
        yPercent: -28,
        opacity: 0.15,
        ease: "none",
        scrollTrigger: trigger,
      });
      gsap.to(".hero-parallax-visual", {
        yPercent: 20,
        ease: "none",
        scrollTrigger: trigger,
      });
      gsap.to(".hero-pulse", {
        scale: 1.6,
        opacity: 0.1,
        ease: "none",
        scrollTrigger: trigger,
      });

      ScrollTrigger.create({
        ...trigger,
        onUpdate: (self) => {
          scrollRef.current = self.progress;
        },
      });
    }, root);
    return () => ctx.revert();
  }, [reduce]);

  const onMove = (e: ReactMouseEvent<HTMLElement>) => {
    const section = root.current;
    if (!section) return;
    const rect = section.getBoundingClientRect();
    pointerRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointerRef.current.y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
  };

  return (
    <section
      id="top"
      ref={root}
      onMouseMove={onMove}
      data-bg="light"
      className="hero-section relative flex min-h-svh items-center overflow-hidden pb-20 pt-32 md:pt-36"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(55%_45%_at_78%_28%,rgba(217,28,43,0.1),transparent_70%)]"
      />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-14 px-6 md:px-10 lg:grid-cols-2 lg:gap-8">
        <div className="hero-parallax-copy will-change-transform">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05, ease: EASE }}
            className="inline-flex items-center gap-2 rounded-full border border-fog bg-white/70 px-3.5 py-1.5 backdrop-blur-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blood opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-blood" />
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blood">
              Emergency blood matching
            </span>
          </motion.div>

          <h1 className="mt-7 text-balance font-display text-[2.6rem] font-bold leading-[1.04] tracking-tight text-ink sm:text-6xl lg:text-[4.4rem]">
            <MaskLine delay={0.14} reduce={reduce}>
              Find a donor in
            </MaskLine>
            <MaskLine delay={0.24} reduce={reduce}>
              <span className="text-blood">the minutes</span> that matter.
            </MaskLine>
          </h1>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.42, ease: EASE }}
            className="mt-6 max-w-md text-lg leading-relaxed text-mute"
          >
            When a crisis hits, waiting isn&apos;t an option. Donate the Blood keeps a
            verified network of donors nearby — so the match that saves a life is
            already close.
          </motion.p>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55, ease: EASE }}
            className="mt-9 flex flex-col gap-3.5 sm:flex-row sm:items-center"
          >
            <MagneticButton
              href="/find-a-donor"
              className="group rounded-full bg-blood px-8 py-4 text-[15px] font-semibold text-white shadow-[0_16px_40px_-14px_rgba(217,28,43,0.75)] hover:bg-blood-deep"
            >
              Find a Donor
              <ArrowRight
                size={17}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </MagneticButton>
            <MagneticButton
              href="/register"
              className="rounded-full border border-ink/15 px-8 py-4 text-[15px] font-semibold text-ink transition-colors duration-300 hover:border-ink hover:bg-ink hover:text-white"
            >
              Become a Donor
            </MagneticButton>
          </motion.div>

          <motion.p
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.72, ease: EASE }}
            className="mt-5 text-sm text-mute"
          >
            Free for recipients and donors, always.
          </motion.p>
        </div>

        <div className="hero-parallax-visual will-change-transform">
          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.5, ease: EASE }}
            className="relative mx-auto aspect-square w-full max-w-[min(74vw,420px)] sm:max-w-[440px]"
          >
            <div
              aria-hidden="true"
              className="hero-pulse absolute inset-0 rounded-full border-2 border-blood/25"
            />

            <div className="animate-beat absolute inset-6 rounded-full border border-blood/15" />

            <div className="absolute inset-0 flex items-center justify-center">
              {scene === "3d" ? (
                <HeroScene scrollRef={scrollRef} pointerRef={pointerRef} />
              ) : (
                <DropGlyph
                  className="animate-float-slow text-blood"
                  size={Math.min(190, 190)}
                />
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.1 }}
        className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-mute"
        aria-hidden="true"
      >
        <span className="text-[10px] font-semibold uppercase tracking-[0.24em]">
          Scroll
        </span>
        <span className="flex h-9 w-[22px] justify-center rounded-full border border-ink/20 pt-1.5">
          <span className="animate-scroll-cue h-2 w-1 rounded-full bg-blood" />
        </span>
      </motion.div>

      <div
        aria-hidden="true"
        className="absolute right-6 top-24 hidden text-blood/40 lg:block"
      >
        <HeartPulse size={22} className="animate-beat opacity-70" />
      </div>
    </section>
  );
}