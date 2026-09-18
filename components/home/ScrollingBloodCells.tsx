"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const RED = { base: "#d91c2b", deep: "#9c1220", tint: "#f0626d" };
const WHITE = { base: "#ffffff", deep: "#cbccd3", tint: "#ffe4e7" };

interface CellConfig {
  size: number;
  top: string;
  lane: string;
  travel: number;
  wobble: number;
  wobbleDuration: number;
  spinDuration: number;
  spinDir: number;
  rot: number;
  opacity: number;
  blur: string;
  mobile: boolean;
}

const CELLS: CellConfig[] = [
  {
    size: 110,
    top: "12%",
    lane: "right-[7%]",
    travel: 0.55,
    wobble: 26,
    wobbleDuration: 5.2,
    spinDuration: 26,
    spinDir: 1,
    rot: 12,
    opacity: 0.95,
    blur: "none",
    mobile: true,
  },
  {
    size: 74,
    top: "31%",
    lane: "left-[9%]",
    travel: 0.3,
    wobble: 18,
    wobbleDuration: 6.4,
    spinDuration: 34,
    spinDir: -1,
    rot: -24,
    opacity: 0.7,
    blur: "blur(2px)",
    mobile: true,
  },
  {
    size: 44,
    top: "54%",
    lane: "left-[41%]",
    travel: -0.14,
    wobble: 14,
    wobbleDuration: 7.6,
    spinDuration: 44,
    spinDir: 1,
    rot: 30,
    opacity: 0.55,
    blur: "blur(3px)",
    mobile: false,
  },
  {
    size: 58,
    top: "22%",
    lane: "left-[32%]",
    travel: 0.42,
    wobble: 22,
    wobbleDuration: 5.8,
    spinDuration: 22,
    spinDir: -1,
    rot: -40,
    opacity: 0.9,
    blur: "blur(1px)",
    mobile: false,
  },
  {
    size: 36,
    top: "68%",
    lane: "right-[30%]",
    travel: 0.26,
    wobble: 16,
    wobbleDuration: 7,
    spinDuration: 28,
    spinDir: 1,
    rot: 45,
    opacity: 0.78,
    blur: "blur(2px)",
    mobile: false,
  },
];

export default function ScrollingBloodCells() {
  const divs = useRef<(HTMLDivElement | null)[]>([]);
  const deeps = useRef<(SVGGraphicsElement | null)[]>([]);
  const bases = useRef<(SVGGraphicsElement | null)[]>([]);
  const tints = useRef<(SVGGraphicsElement | null)[]>([]);
  const colors = useRef<{ base: string; deep: string; tint: string }[]>(
    CELLS.map(() => ({ ...RED }))
  );

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      const applyColor = (i: number) => {
        const c = colors.current[i];
        if (!c) return;
        deeps.current[i]?.setAttribute("fill", c.deep);
        bases.current[i]?.setAttribute("fill", c.base);
        tints.current[i]?.setAttribute("fill", c.tint);
      };

      const applyAll = () => {
        CELLS.forEach((_, i) => applyColor(i));
      };

      const computeTone = (): "light" | "dark" => {
        const mid = window.innerHeight / 2;
        const sections = gsap.utils.toArray<HTMLElement>("[data-bg]");
        for (const s of sections) {
          const r = s.getBoundingClientRect();
          if (r.top <= mid && r.bottom >= mid) {
            return s.dataset.bg === "dark" ? "dark" : "light";
          }
        }
        return "light";
      };

      let activeTone: "light" | "dark" = computeTone();

      const setPalette = (tone: "light" | "dark", instant: boolean) => {
        if (tone === activeTone && !instant) return;
        activeTone = tone;
        const pal = tone === "dark" ? WHITE : RED;
        CELLS.forEach((_, i) => {
          if (instant) {
            Object.assign(colors.current[i], pal);
            applyColor(i);
          } else {
            gsap.killTweensOf(colors.current[i]);
            gsap.to(colors.current[i], {
              ...pal,
              duration: 0.5,
              ease: "power2.out",
              overwrite: true,
              onUpdate: () => applyColor(i),
            });
          }
        });
      };

      applyAll();
      setPalette(activeTone, true);

      // Safety net: re-apply once more on the next frame in case any ref
      // (e.g. a newly-added cell) attached slightly after this effect ran.
      requestAnimationFrame(applyAll);

      if (reduce) return;

      CELLS.forEach((cfg, i) => {
        const el = divs.current[i];
        if (!el) return;
        gsap.to(el, {
          x: cfg.wobble,
          duration: cfg.wobbleDuration,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
        });
        gsap.to(el, {
          rotation: cfg.rot + cfg.spinDir * 360,
          duration: cfg.spinDuration,
          ease: "none",
          repeat: -1,
        });
      });

      const pageEnd = () =>
        Math.max(1, document.documentElement.scrollHeight - window.innerHeight);

      const drift = gsap.timeline({
        scrollTrigger: {
          start: 0,
          end: pageEnd,
          scrub: 0.8,
        },
      });
      CELLS.forEach((cfg, i) => {
        drift.to(
          divs.current[i],
          {
            y: () => window.innerHeight * cfg.travel,
            ease: "none",
          },
          0
        );
      });

      ScrollTrigger.create({
        start: 0,
        end: pageEnd,
        onUpdate: () => setPalette(computeTone(), false),
      });

      // Recheck after layout settles (fonts/images loading can shift
      // section positions right after mount).
      requestAnimationFrame(() => setPalette(computeTone(), true));
    }, undefined);

    return () => ctx.revert();
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[5] overflow-hidden"
    >
      {CELLS.map((cfg, i) => (
        <div
          key={i}
          ref={(el) => {
            divs.current[i] = el;
          }}
          className={`absolute ${cfg.lane} ${cfg.mobile ? "" : "hidden md:block"}`}
          style={{
            top: cfg.top,
            width: cfg.size,
            height: cfg.size,
            opacity: cfg.opacity,
            filter: cfg.blur,
            willChange: "transform",
          }}
        >
          <svg viewBox="0 0 100 100" className="h-full w-full">
            <ellipse
              cx="50"
              cy="50"
              rx="48"
              ry="41"
              fill={RED.deep}
              ref={(el) => {
                deeps.current[i] = el;
              }}
            />
            <ellipse
              cx="50"
              cy="50"
              rx="30"
              ry="25"
              fill={RED.base}
              ref={(el) => {
                bases.current[i] = el;
              }}
            />
            <ellipse
              cx="34"
              cy="31"
              rx="14"
              ry="10"
              transform="rotate(-22 34 31)"
              fill={RED.tint}
              ref={(el) => {
                tints.current[i] = el;
              }}
            />
          </svg>
        </div>
      ))}
    </div>
  );
}