import { ArrowRight } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import MagneticButton from "@/components/ui/MagneticButton";
import DropGlyph from "@/components/ui/DropGlyph";

export default function AboutTeaser() {
  return (
    <section id="about" className="relative bg-white py-20 md:py-28">
      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 px-6 md:px-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <Reveal>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blood">
              About Donate the Blood
            </p>
            <h2 className="mt-4 max-w-xl text-balance font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Built by people who&rsquo;ve{" "}
              <span className="text-blood">waited for a donor</span> too
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-mute sm:text-lg">
              In an emergency, every hour matters — yet most blood requests still travel as
              screenshots sent across WhatsApp groups and Facebook posts: urgent, scattered, and
              impossible to verify. Donate the Blood replaces that guesswork with something simpler,
              verified, and fast — so the person waiting isn&rsquo;t left refreshing group chats at 2am.
            </p>
            <div className="mt-8">
              <MagneticButton
                href="/about"
                className="group inline-flex items-center gap-2 rounded-full border border-ink/15 bg-white px-7 py-3.5 text-sm font-semibold text-ink transition-colors hover:border-blood hover:text-blood"
              >
                Read our full story
                <ArrowRight
                  size={16}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </MagneticButton>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.15} direction="right">
          <div className="relative mx-auto w-full max-w-md">
            <div className="rounded-3xl border border-fog bg-white p-6 shadow-[0_24px_70px_-40px_rgba(10,10,10,0.35)] sm:p-7">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-blood/10">
                  <DropGlyph size={20} className="text-blood" />
                </span>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-mute">
                    Live alert · Karachi
                  </p>
                  <p className="text-sm font-bold text-ink">O+ needed · Jinnah Hospital</p>
                </div>
              </div>
              <div className="mt-5 space-y-2.5">
                <div className="flex items-center justify-between rounded-xl bg-smoke px-3.5 py-2.5 text-xs">
                  <span className="font-medium text-ink">Verified donors nearby</span>
                  <span className="font-bold text-blood">5</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-smoke px-3.5 py-2.5 text-xs">
                  <span className="font-medium text-ink">Nearest match</span>
                  <span className="font-bold text-ink">1.2 km</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-ink px-3.5 py-2.5 text-xs text-white">
                  <span className="font-medium text-white/70">Request answered in</span>
                  <span className="font-bold text-white">6 min</span>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}