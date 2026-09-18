import { ShieldCheck, EyeOff, Zap } from "lucide-react";
import Reveal from "@/components/ui/Reveal";

const TRUST_POINTS = [
  {
    icon: ShieldCheck,
    title: "Verified donors",
    line: "Identity and blood type are checked before anyone goes live.",
  },
  {
    icon: EyeOff,
    title: "Privacy-respecting",
    line: "Medical details stay private. Recipients only see what they need.",
  },
  {
    icon: Zap,
    title: "Fast alerts",
    line: "Emergency requests reach donors in minutes, not days.",
  },
];

export default function TrustSection() {
  return (
    <section data-bg="light" className="relative bg-white py-24 md:py-32">
      <div className="relative z-10 mx-auto max-w-6xl px-6 md:px-10">
        <Reveal className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blood">
            Why it matters
          </p>
          <h2 className="mt-3 text-balance font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Trust, built into every match.
          </h2>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
          {TRUST_POINTS.map((point, i) => (
            <Reveal key={point.title} delay={i * 0.14} duration={0.7}>
              <div className="group">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blush text-blood transition-colors duration-300 group-hover:bg-blood group-hover:text-white">
                  <point.icon size={22} strokeWidth={1.8} />
                </span>
                <h3 className="mt-5 font-display text-lg font-bold tracking-tight text-ink">
                  {point.title}
                </h3>
                <p className="mt-2 max-w-[30ch] text-[15px] leading-relaxed text-mute">
                  {point.line}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}