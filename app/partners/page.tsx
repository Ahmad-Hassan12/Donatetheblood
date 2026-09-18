import { ArrowRight, Building2, Handshake, Briefcase, Sparkles, Globe } from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import SectionHeading from "@/components/ui/SectionHeading";
import FeatureCard from "@/components/ui/FeatureCard";
import Reveal from "@/components/ui/Reveal";
import MagneticButton from "@/components/ui/MagneticButton";

const PARTNERSHIP_TYPES = [
  {
    icon: Building2,
    title: "Hospitals & blood banks",
    body: "Real-time visibility into nearby available donors during shortages, so coordinated appeals reach working donors first.",
  },
  {
    icon: Handshake,
    title: "NGOs & community organizations",
    body: "Co-host donation drives, reach more verified donors, and extend your community's reach far beyond the usual networks.",
  },
  {
    icon: Briefcase,
    title: "Corporate & CSR partners",
    body: "Sponsor the infrastructure behind verification, or run workplace donation campaigns that make giving blood part of company culture.",
  },
];

export default function PartnersPage() {
  return (
    <main data-bg="light" className="min-h-svh bg-white pb-24">
      <section className="pt-28 pb-14 md:pt-36 md:pb-16">
        <PageHero
          eyebrow="Partners"
          title="Partners"
          subtitle="We're stronger together — hospitals, blood banks, and organizations working alongside us to save more lives."
        />
      </section>

      <div className="mx-auto max-w-6xl space-y-24 px-6 md:px-10 md:space-y-28">
        <section>
          <SectionHeading
            eyebrow="Why partner with us"
            title="A verified donor pipeline, lean on when it matters"
          />
          <div className="mx-auto mt-12 max-w-3xl space-y-5 text-base leading-8 text-mute">
            <Reveal>
              <p>
                Blood shortages don&rsquo;t follow a schedule. A hospital can go from{" "}
                <span className="font-semibold text-ink">well stocked</span> to{" "}
                <span className="font-semibold text-ink">urgently needed</span> within hours, and
                when that happens the difference between a good outcome and a tense one is often
                proximity — who is close, verified, and available right now.
              </p>
            </Reveal>
            <Reveal>
              <p>
                That&rsquo;s what partners plug into. Hospitals and blood banks get a verified donor
                pipeline to lean on during shortages. NGOs reach more verified donors and
                communities. Corporates turn employee goodwill into structured, supported donation
                drives.
              </p>
            </Reveal>
            <Reveal>
              <p>
                Partnership is a force multiplier. Every organization that joins us brings donors,
                credibility, and reach that a lone platform can&rsquo;t build alone — and every one of
                them shares the same outcome metric:{" "}
                <span className="font-semibold text-ink">a request answered</span>.
              </p>
            </Reveal>
          </div>
        </section>

        <section>
          <SectionHeading
            eyebrow="Ways to work together"
            title="Partnership that fits how you operate"
          />
          <Reveal className="mt-12">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {PARTNERSHIP_TYPES.map((p) => (
                <FeatureCard key={p.title} icon={p.icon} title={p.title}>
                  {p.body}
                </FeatureCard>
              ))}
            </div>
          </Reveal>
        </section>

        <section>
          <Reveal className="overflow-hidden rounded-[2.5rem] bg-ink px-6 py-16 text-center sm:px-12">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white/5">
              <Sparkles size={24} className="text-blood" />
            </span>
            <h2 className="mx-auto mt-6 max-w-2xl text-balance font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Our current partners
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/60">
              We&rsquo;re proud to collaborate with organizations that share our mission of saving lives
              through seamless blood donation. Here are the partners standing with us.
            </p>

            <div className="mx-auto mt-10 grid max-w-3xl gap-6 sm:grid-cols-1">
              <Reveal>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-8 py-8 text-left backdrop-blur-sm">
                  <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-2">
                      <h3 className="font-display text-xl font-bold text-white">Kivro Solutions</h3>
                      <p className="text-sm leading-relaxed text-white/60">
                        A forward-thinking software agency delivering innovative digital solutions.
                        Kivro Solutions partners with us to power the technology that connects
                        verified donors with those in need — turning code into lifesaving impact.
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-3">
                      <a
                        href="https://kivrosolutions.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-white/70 transition-colors hover:bg-blood hover:text-white"
                        aria-label="Kivro Solutions website"
                      >
                        <Globe size={18} />
                      </a>
                      <a
                        href="https://www.linkedin.com/company/kivro-solutions"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-white/70 transition-colors hover:bg-blood hover:text-white"
                        aria-label="Kivro Solutions LinkedIn"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                      </a>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>

            <div className="mt-10">
              <MagneticButton
                href="/contact?subject=partnership"
                className="rounded-full bg-blood px-7 py-3.5 text-sm font-semibold text-white shadow-[0_14px_32px_-12px_rgba(217,28,43,0.8)] hover:bg-blood-deep"
              >
                Become a founding partner
                <ArrowRight size={16} />
              </MagneticButton>
            </div>
          </Reveal>
        </section>

        <section>
          <Reveal className="rounded-[2.5rem] border border-fog bg-smoke/60 px-6 py-14 text-center sm:px-12">
            <h2 className="mx-auto max-w-2xl text-balance font-display text-3xl font-bold tracking-tight text-ink">
              Interested in partnering with us?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-mute">
              Tell us who you are and what you&rsquo;d like to do — we&rsquo;ll take it from there. The
              link below opens our contact form with the subject pre-filled as{" "}
              <span className="font-semibold text-ink">Partnership</span>.
            </p>
            <div className="mt-8">
              <MagneticButton
                href="/contact?subject=partnership"
                className="rounded-full border border-ink/25 bg-white px-7 py-3.5 text-sm font-semibold text-ink hover:border-blood hover:text-blood"
              >
                Get in touch
                <ArrowRight size={16} />
              </MagneticButton>
            </div>
          </Reveal>
        </section>
      </div>
    </main>
  );
}