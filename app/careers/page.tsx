import { ArrowRight, Briefcase, Home, Compass, HeartHandshake } from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import SectionHeading from "@/components/ui/SectionHeading";
import FeatureCard from "@/components/ui/FeatureCard";
import Reveal from "@/components/ui/Reveal";
import MagneticButton from "@/components/ui/MagneticButton";

const LIFE_POINTS = [
  {
    icon: Home,
    title: "Remote-friendly",
    body: "Work from where you do your best; the mission travels with you.",
  },
  {
    icon: Compass,
    title: "Mission over metrics",
    body: "We'd rather ship one good match than chase a vanity dashboard.",
  },
  {
    icon: HeartHandshake,
    title: "Direct user impact",
    body: "Your work today may be the reason a stranger gets help tonight.",
  },
];

export default function CareersPage() {
  return (
    <main data-bg="light" className="min-h-svh bg-white pb-24">
      <section className="pt-28 pb-14 md:pt-36 md:pb-16">
        <PageHero
          eyebrow="Careers"
          title="Careers"
          subtitle="Help us build the fastest, most trusted way to find a blood donor — and do work that counts in real time."
        />
      </section>

      <div className="mx-auto max-w-6xl space-y-24 px-6 md:px-10 md:space-y-28">
        <section>
          <SectionHeading
            eyebrow="Why work with us"
            title="Software that shows up in someone's most stressful hour"
          />
          <div className="mx-auto mt-12 max-w-3xl space-y-5 text-base leading-8 text-mute">
            <Reveal>
              <p>
                Donate the Blood is a small team working on a problem that counts in real time — every
                feature we ship either brings someone closer to a donor or it doesn&rsquo;t. That keeps
                the work honest.
              </p>
            </Reveal>
            <Reveal>
              <p>
                We make software that shows up at 2am, in a hospital corridor, for someone who has
                run out of options. It&rsquo;s a rare kind of pressure — and a rare kind of motivation:
                the person who receives the alert, and the person whose life depends on it
                responding.
              </p>
            </Reveal>
          </div>
        </section>

        <section>
          <SectionHeading
            eyebrow="Life at Donate the Blood"
            title="What working here is actually like"
            lede="Small team, big stakes, and a few principles we don't negotiate."
          />
          <Reveal className="mt-12">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {LIFE_POINTS.map((p) => (
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
              <Briefcase size={24} className="text-blood" />
            </span>
            <h2 className="mx-auto mt-6 max-w-2xl text-balance font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              No open positions right now
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/60">
              But we&rsquo;re always excited to hear from people who care about this mission —
              engineers, designers, community leads. Send us your resume or a note, and we&rsquo;ll
              keep you in mind for the work ahead.
            </p>
            <div className="mt-8">
              <MagneticButton
                href="/contact?subject=careers"
                className="rounded-full bg-blood px-7 py-3.5 text-sm font-semibold text-white shadow-[0_14px_32px_-12px_rgba(217,28,43,0.8)] hover:bg-blood-deep"
              >
                Send us your resume anyway
                <ArrowRight size={16} />
              </MagneticButton>
            </div>
          </Reveal>
        </section>
      </div>
    </main>
  );
}