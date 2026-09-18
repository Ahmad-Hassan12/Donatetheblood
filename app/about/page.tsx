import { ArrowRight, CheckCircle2, Globe, Lock, ShieldCheck, Timer } from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import SectionHeading from "@/components/ui/SectionHeading";
import FeatureCard from "@/components/ui/FeatureCard";
import Reveal from "@/components/ui/Reveal";
import MagneticButton from "@/components/ui/MagneticButton";

const VALUES = [
  {
    icon: Timer,
    title: "Speed",
    body: "Emergencies don't wait for a convenient time. We build for the minutes, not the days.",
  },
  {
    icon: ShieldCheck,
    title: "Trust",
    body: "Every donor is verified before they're searchable, and every request is treated as real. Trust is the product.",
  },
  {
    icon: Lock,
    title: "Privacy",
    body: "Your information is shared only with your consent. Donors never appear publicly with full contact details.",
  },
  {
    icon: Globe,
    title: "Accessibility",
    body: "Free to use, and built to work for everyone and everywhere — no premium tier for emergencies.",
  },
];

const VERIFICATION_STEPS = [
  "ID-backed verification before a donor appears in search results",
  "A cooldown after each donation, so availability reflects reality",
  "Contact details shared only with the requester's explicit consent",
];

export default function AboutPage() {
  return (
    <main data-bg="light" className="min-h-svh bg-white pb-24">
      <section className="pt-28 pb-14 md:pt-36 md:pb-16">
        <PageHero
          eyebrow="About us"
          title="Our Mission"
          subtitle="Every blood request is a race against time. We're here to make sure no one runs that race alone."
        />
      </section>

      <div className="mx-auto max-w-6xl space-y-24 px-6 md:px-10 md:space-y-28">
        <section>
          <SectionHeading
            eyebrow="Why we started"
            title="The problem: a screenshot, emailed onward, until it goes cold"
          />
          <div className="mt-12 grid items-center gap-12 lg:grid-cols-[1fr_0.85fr]">
            <Reveal direction="left">
              <div className="space-y-5 text-base leading-8 text-mute">
                <p>
                  When a hospital bed needs blood, the minutes between{" "}
                  <span className="font-semibold text-ink">&ldquo;we have a request&rdquo;</span> and{" "}
                  <span className="font-semibold text-ink">&ldquo;a donor is on the way&rdquo;</span>{" "}
                  are the entire story. And right now, for too many families, that story begins
                  with a screenshot.
                </p>
                <p>
                  A photo of a request — blood group, hospital, phone number — gets passed from
                  one WhatsApp group to another, reshared on Facebook, and forwarded until it reaches
                  thousands of people who can&rsquo;t help and barely reaches the few who can. A matching
                  blood type is useless if the donor lives three cities away, can&rsquo;t be reached before
                  the lead goes cold, or has already seen the same post three times without a way to say
                  they&rsquo;re on their way.
                </p>
                <p>
                  There&rsquo;s no field on a forwarded image that says{" "}
                  <span className="font-semibold text-ink">verified</span>,{" "}
                  <span className="font-semibold text-ink">nearby</span>, or{" "}
                  <span className="font-semibold text-ink">available right now</span>. So requesters
                  chase dead leads at midnight, and willing donors are spammed by every group they&rsquo;ve
                  ever joined. That&rsquo;s the gap we built Donate the Blood to close — not another place to
                  post a request, but a way to make requests answerable.
                </p>
              </div>
            </Reveal>

            <Reveal direction="right" delay={0.1}>
              <div className="rounded-3xl border border-fog bg-smoke/60 p-6 sm:p-8">
                <div className="mx-auto max-w-sm space-y-3">
                  <div className="rounded-2xl rounded-tl-sm bg-white p-4 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-wide text-blood">URGENT · O+</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink">
                      Blood needed for surgery today at Jinnah Hospital. Please share &amp; forward
                      🙏
                    </p>
                    <p className="mt-2 text-[11px] text-mute">Forwarded · 12:41 AM</p>
                  </div>
                  <div className="rounded-2xl rounded-tl-sm bg-white p-4 shadow-sm">
                    <p className="text-sm leading-relaxed text-ink">
                      Any O+ donors in Karachi tonight?
                    </p>
                    <p className="mt-2 text-[11px] text-mute">Forwarded · 12:52 AM · 3 groups</p>
                  </div>
                  <div className="rounded-2xl rounded-tl-sm bg-white p-4 shadow-sm">
                    <p className="text-xs leading-relaxed text-mute">
                      No one can confirm availability. Threads go cold by morning.
                    </p>
                  </div>
                  <div className="rounded-2xl rounded-br-sm bg-blood p-4 text-white shadow-md">
                    <p className="text-sm font-medium leading-relaxed">
                      …while Donate the Blood matches verified, nearby donors and notifies them
                      automatically.
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section>
          <SectionHeading
            eyebrow="What we do"
            title="Fast, local, and personal — the way an emergency actually moves"
          />
          <div className="mx-auto mt-12 max-w-3xl space-y-5 text-base leading-8 text-mute">
            <Reveal>
              <p>
                A donor registers once — their blood group, their city and area, and their consent
                to be contacted. Nothing is publicly listed with full contact details. When a
                request is raised, requesters search by blood group and location, and the nearest{" "}
                <span className="font-semibold text-ink">verified, available</span> donors are
                alerted automatically. Donor contact information is shared with a requester only
                when that donor consents — usually by responding to the alert.
              </p>
            </Reveal>
            <Reveal>
              <p>
                For recipients it&rsquo;s free, and always will be. For donors, it&rsquo;s the
                difference between a group chat you browse and a button you can actually press when
                someone nearby needs you.
              </p>
            </Reveal>
          </div>
        </section>

        <section>
          <SectionHeading
            eyebrow="Our values"
            title="What we hold ourselves to"
            lede="Four principles guide every decision, from how we verify a donor to how we build a feature."
          />
          <Reveal className="mt-12">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {VALUES.map((v) => (
                <FeatureCard key={v.title} icon={v.icon} title={v.title}>
                  {v.body}
                </FeatureCard>
              ))}
            </div>
          </Reveal>
        </section>

        <section>
          <SectionHeading
            eyebrow="How we verify"
            title="Trust isn't a feature. It's the product."
            lede="The platform only works if requesters can trust who they're reaching out to — and donors can trust that they'll be treated with respect."
          />
          <div className="mx-auto mt-12 max-w-3xl space-y-5 text-base leading-8 text-mute">
            <Reveal>
              <p>
                Donors go through a verification step before they appear in search results —
                typically a quick review by an administrator, supported by your ID. It&rsquo;s not
                bureaucracy; it&rsquo;s so that when a family calls the number on a request, they&rsquo;re
                calling a real, available donor.
              </p>
            </Reveal>
            <Reveal>
              <ul className="space-y-3">
                {VERIFICATION_STEPS.map((step) => (
                  <li key={step} className="flex items-start gap-3">
                    <CheckCircle2 size={19} className="mt-1 shrink-0 text-blood" />
                    <span className="text-mute">{step}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal>
              <p>
                We also respect your body&rsquo;s timing: a donor who has given blood recently is
                marked unavailable for three months, and you control your availability at any
                time.
              </p>
            </Reveal>
          </div>
        </section>

        <section>
          <Reveal className="overflow-hidden rounded-[2.5rem] bg-ink px-6 py-16 text-center sm:px-12">
            <h2 className="mx-auto max-w-2xl text-balance font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Be the reason someone <span className="text-blood">stops waiting</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/60">
              The next request could be raised two streets from you. Registering takes five
              minutes; being there takes one call.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <MagneticButton
                href="/register"
                className="rounded-full bg-blood px-7 py-3.5 text-sm font-semibold text-white shadow-[0_14px_32px_-12px_rgba(217,28,43,0.8)] hover:bg-blood-deep"
              >
                Register as a donor
                <ArrowRight size={16} />
              </MagneticButton>
              <MagneticButton
                href="/contact"
                className="rounded-full border border-white/20 px-7 py-3.5 text-sm font-semibold text-white/80 hover:border-white/50 hover:text-white"
              >
                Have a partnership idea? Get in touch
              </MagneticButton>
            </div>
          </Reveal>
        </section>
      </div>
    </main>
  );
}