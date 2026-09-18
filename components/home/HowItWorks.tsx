import { Megaphone, Radar, HeartHandshake } from "lucide-react";
import Reveal from "@/components/ui/Reveal";

const STEPS = [
  {
    icon: Megaphone,
    step: "01",
    title: "Send an alert",
    line: "Share your location, blood type, and urgency in seconds.",
  },
  {
    icon: Radar,
    step: "02",
    title: "Get matched",
    line: "Nearby verified donors are pinged instantly — no waiting rooms.",
  },
  {
    icon: HeartHandshake,
    step: "03",
    title: "Save a life",
    line: "The transfusion starts while there's still time to spare.",
  },
];

export default function HowItWorks() {
  return (
    <section data-bg="light" className="relative bg-white py-24 md:py-32">
      <div className="relative z-10 mx-auto max-w-6xl px-6 md:px-10">
        <Reveal className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blood">
            How it works
          </p>
          <h2 className="mt-3 text-balance font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Three steps from alert to transfusion.
          </h2>
        </Reveal>

        <div className="relative mt-16 grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8">
          <div
            aria-hidden="true"
            className="absolute left-[16.6%] right-[16.6%] top-7 hidden border-t border-dashed border-fog md:block"
          />

          {STEPS.map((step, i) => (
            <Reveal
              key={step.step}
              delay={i * 0.16}
              duration={0.7}
              className="relative"
            >
              <div className="group">
                <div className="relative inline-flex">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blush text-blood transition-colors duration-300 group-hover:bg-blood group-hover:text-white">
                    <step.icon size={24} strokeWidth={1.8} />
                  </span>
                  <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white text-[10px] font-bold text-blood shadow-sm ring-1 ring-fog">
                    {step.step}
                  </span>
                </div>
                <h3 className="mt-6 font-display text-xl font-bold tracking-tight text-ink">
                  {step.title}
                </h3>
                <p className="mt-2 max-w-[26ch] text-[15px] leading-relaxed text-mute">
                  {step.line}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}