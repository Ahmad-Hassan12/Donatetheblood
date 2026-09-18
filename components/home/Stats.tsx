"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";
import Reveal from "@/components/ui/Reveal";

interface StatDef {
  value: number;
  suffix: string;
  label: string;
  accent?: boolean;
}

const STATS: StatDef[] = [
  { value: 128400, suffix: "", label: "Verified donors", accent: true },
  { value: 42900, suffix: "", label: "Lives touched" },
  { value: 96, suffix: "%", label: "Requests fulfilled" },
  { value: 6, suffix: " min", label: "Avg. response time" },
];

function Counter({ stat }: { stat: StatDef }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-12% 0px -12% 0px" });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, stat.value, {
      duration: reduce ? 0.2 : 2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [inView, reduce, stat.value]);

  return (
    <div ref={ref} className="flex flex-col items-center gap-2 text-center">
      <div className="font-display text-5xl font-bold tracking-tight text-ink tabular-nums sm:text-6xl">
        {Math.round(display).toLocaleString("en-US")}
        {stat.suffix && (
          <span
            className={
              stat.accent ? "pl-0.5 text-blood" : "pl-0.5 text-mute"
            }
          >
            {stat.suffix}
          </span>
        )}
      </div>
      <p className="text-[13px] font-medium uppercase tracking-[0.16em] text-mute">
        {stat.label}
      </p>
    </div>
  );
}

export default function Stats() {
  return (
    <section data-bg="light" className="relative border-y border-fog bg-white py-20 md:py-28">
      <div className="relative z-10 mx-auto max-w-6xl px-6 md:px-10">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blood">
            Live impact
          </p>
          <h2 className="mt-3 text-balance font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Real numbers, updated live.
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {STATS.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.1} duration={0.7}>
              <Counter stat={stat} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}