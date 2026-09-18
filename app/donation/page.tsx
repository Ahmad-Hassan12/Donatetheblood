import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  ClipboardCheck,
  Droplets,
  HeartPulse,
  Info,
  Plus,
  Wallet,
  Building2,
  Smartphone,
} from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import MagneticButton from "@/components/ui/MagneticButton";
import DropGlyph from "@/components/ui/DropGlyph";

const ELIGIBILITY = [
  "Between 18 and 65 years of age",
  "Weighing at least 50 kg",
  "Generally healthy and feeling well on the day",
  "At least 3 months since your last donation",
  "Arrived after a proper meal and well hydrated",
  "Carrying a government-issued ID such as your CNIC",
];

const PROCESS = [
  {
    icon: ClipboardCheck,
    step: "01",
    title: "Check-in & screening",
    line: "Your ID is verified, a sterile kit is opened in front of you, and a short questionnaire covers your health and recent travel.",
  },
  {
    icon: HeartPulse,
    step: "02",
    title: "Vitals check",
    line: "A quick finger-prick tests hemoglobin, and your blood pressure, pulse, and temperature are confirmed before you donate.",
  },
  {
    icon: Droplets,
    step: "03",
    title: "The donation",
    line: "About 450 ml is collected in roughly 10 minutes using a single-use sterile kit — nothing is ever reused.",
  },
  {
    icon: BadgeCheck,
    step: "04",
    title: "Rest & refresh",
    line: "You rest for 15 minutes, enjoy the snacks and drinks provided, and receive a summary with your next eligible date.",
  },
];

const BLOOD_TYPES = [
  { group: "O−", gives: "All blood types", receives: "O−", tag: "Universal donor" },
  { group: "O+", gives: "O+, A+, B+, AB+", receives: "O+, O−" },
  { group: "A−", gives: "A−, A+, AB−, AB+", receives: "A−, O−" },
  { group: "A+", gives: "A+, AB+", receives: "A+, A−, O+, O−" },
  { group: "B−", gives: "B−, B+, AB−, AB+", receives: "B−, O−" },
  { group: "B+", gives: "B+, AB+", receives: "B+, B−, O+, O−" },
  { group: "AB−", gives: "AB−, AB+", receives: "AB−, A−, B−, O−" },
  { group: "AB+", gives: "AB+", receives: "All blood types", tag: "Universal recipient" },
];

const WALLETS = [
  { name: "NayaPay", holder: "Ahmad Hassan", number: "+92 318 8337822" },
  { name: "Easypaisa", holder: "Ahmad Hassan", number: "+92 318 8337822" },
  { name: "Easypaisa", holder: "Temoor Iqbal", number: "+92 305 4253021" },
];

const BANKS = [
  { name: "HBL", holder: "Donate the Blood", number: "1234-5678-9012-3456", available: false },
  { name: "Meezan Bank", holder: "Donate the Blood", number: "9876-5432-1098-7654", available: false },
  { name: "UBL", holder: "Donate the Blood", number: "1122-3344-5566-7788", available: false },
];

const FAQS = [
  {
    q: "Is donating blood painful?",
    a: "Most donors describe it as a quick pinch that fades within a few seconds. The draw itself doesn't hurt — you may feel a slight coolness at the needle site. The team talks you through every step.",
  },
  {
    q: "How long does the whole visit take?",
    a: "Plan for about 45 minutes in total. The paperwork and mini physical take the longest; the actual collection is only around 10 minutes, followed by 15 minutes of rest.",
  },
  {
    q: "How much blood is taken?",
    a: "Approximately 450 ml, which is less than 10% of the blood in an adult body. Your body replaces the fluid within hours and the red cells within a few weeks.",
  },
  {
    q: "How often can I donate?",
    a: "For whole blood, a healthy donor can give every 3 months — that works out to a maximum of 4 donations a year for men and slightly less for women.",
  },
  {
    q: "Will I feel weak afterwards?",
    a: "Most people feel completely fine and often report a mild energy surge. Dizziness is rare and usually avoided by eating beforehand, drinking water, and resting after the donation.",
  },
  {
    q: "Are the needles safe?",
    a: "Every needle and bag is sterile, single-use, and disposed of immediately after your donation. It is impossible to contract hepatitis or HIV by donating blood.",
  },
];

export default function DonationPage() {
  return (
    <main data-bg="light" className="min-h-svh bg-white pb-24">
      <section className="pt-28 pb-14 md:pt-36 md:pb-16">
        <PageHero
          eyebrow="Donation"
          title={
            <>
              One donation, <span className="text-blood">three lives</span>
            </>
          }
          subtitle="What actually happens before, during, and after you give blood — and why your type could be the one a stranger is waiting for right now."
        />
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24 md:px-10 md:pb-28">
        <SectionHeading
          eyebrow="Why it matters"
          title="You can't replace blood. You can offer it."
        />
        <div className="mt-12 grid items-center gap-12 lg:grid-cols-[1fr_0.85fr]">
          <Reveal direction="left">
            <div className="space-y-5 text-base leading-8 text-mute">
              <p>
                Blood can&rsquo;t be made in a lab. It can&rsquo;t be stored indefinitely, and it
                has no substitute. When someone needs it urgently, the only source is another
                person who decided to give — often hours before, and often a stranger. That&rsquo;s
                why a single blood donation is one of the few truly irreplaceable acts you can
                offer.
              </p>
              <p>
                One donation is separated into red cells, plasma, and platelets. Three different
                people can benefit from what you give in a single visit: an accident victim, a
                patient in surgery, and someone whose body can&rsquo;t produce enough platelets.
                That&rsquo;s the <span className="font-semibold text-ink">three lives</span> behind
                our name — not a slogan, just how the bag gets split.
              </p>
              <p>
                And while you might think someone else will step up, whole blood has a shelf life
                of only 42 days. The pool has to keep being topped up, every single day, by
                people like you. It&rsquo;s not a once-a-year favour — it&rsquo;s a renewable
                resource you can give four times a year.
              </p>
            </div>
          </Reveal>

          <Reveal direction="right" delay={0.1}>
            <div className="rounded-3xl border border-fog bg-smoke/60 p-8 text-center sm:p-10">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-blood/10">
                <DropGlyph className="text-blood" size={30} />
              </span>
              <h3 className="mt-6 font-display text-xl font-bold tracking-tight text-ink">
                Up to three people, from one visit
              </h3>
              <p className="mx-auto mt-3 max-w-xs text-[15px] leading-relaxed text-mute">
                Red cells for trauma, plasma for clotting, platelets for cancer care. Your{" "}
                <span className="font-semibold text-ink">450 ml</span> covers all three.
              </p>
              <div className="mt-6 grid grid-cols-3 gap-2 text-center">
                {["Red cells", "Plasma", "Platelets"].map((part) => (
                  <div
                    key={part}
                    className="rounded-xl bg-white px-2 py-3 text-[11px] font-semibold uppercase tracking-wide text-blood ring-1 ring-fog"
                  >
                    {part}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24 md:px-10 md:pb-28">
        <SectionHeading
          eyebrow="Eligibility"
          title="Can you donate? Almost certainly, yes."
          lede="Most healthy adults qualify. A short screening at the centre confirms it — but here are the basics worth knowing before you go."
        />
        <Reveal className="mt-12">
          <div className="grid gap-4 sm:grid-cols-2">
            {ELIGIBILITY.map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-2xl border border-fog bg-white p-4"
              >
                <CheckCircle2 size={19} className="mt-0.5 shrink-0 text-blood" />
                <span className="text-[15px] leading-relaxed text-ink">{item}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section data-bg="dark" className="relative overflow-hidden bg-ink py-24 md:py-32">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(45%_55%_at_50%_0%,rgba(217,28,43,0.12),transparent_75%)]"
        />
        <div className="relative z-10 mx-auto max-w-6xl px-6 md:px-10">
          <Reveal className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blood">
              The process
            </p>
            <h2 className="mt-3 text-balance font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Four steps from check-in to done.
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            {PROCESS.map((step, i) => (
              <Reveal
                key={step.title}
                delay={i * 0.12}
                duration={0.7}
                className="h-full"
              >
                <div className="group h-full rounded-2xl border border-white/10 bg-white/5 p-6 transition-colors duration-300 hover:border-blood/40 hover:bg-white/[0.07]">
                  <div className="flex items-center justify-between">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-blood text-white">
                      <step.icon size={20} strokeWidth={1.9} />
                    </span>
                    <span className="font-display text-sm font-bold text-white/25">
                      0{step.step}
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-lg font-bold tracking-tight text-white">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-white/60">
                    {step.line}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24 md:px-10 md:py-28">
        <SectionHeading
          eyebrow="Blood types"
          title="Know your type, know your reach"
          lede="Your blood group decides exactly who can receive your gift — and which types can cover you. Here's the whole map."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {BLOOD_TYPES.map((bt, i) => (
            <Reveal key={bt.group} delay={i * 0.06} duration={0.6}>
              <div className="h-full rounded-2xl border border-fog bg-white p-5">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-display text-3xl font-bold tracking-tight text-blood">
                    {bt.group}
                  </span>
                  {bt.tag && (
                    <span className="rounded-full bg-blush px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-blood">
                      {bt.tag}
                    </span>
                  )}
                </div>
                <dl className="mt-4 space-y-2.5 text-[14px]">
                  <div className="flex gap-2">
                    <Droplets size={15} className="mt-0.5 shrink-0 text-blood" />
                    <div>
                      <dt className="text-[11px] font-semibold uppercase tracking-wide text-ink">
                        Can give to
                      </dt>
                      <dd className="text-mute">{bt.gives}</dd>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <HeartPulse size={15} className="mt-0.5 shrink-0 text-blood" />
                    <div>
                      <dt className="text-[11px] font-semibold uppercase tracking-wide text-ink">
                        Can receive from
                      </dt>
                      <dd className="text-mute">{bt.receives}</dd>
                    </div>
                  </div>
                </dl>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section data-bg="dark" className="relative overflow-hidden bg-ink py-24 md:py-32">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(50%_60%_at_80%_10%,rgba(217,28,43,0.16),transparent_70%)]"
        />
        <div className="relative z-10 mx-auto max-w-6xl px-6 md:px-10">
          <Reveal className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blood">
              Support us
            </p>
            <h2 className="mt-3 text-balance font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Help keep this running for everyone.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/60">
              Your monetary support helps cover server costs, verification, and outreach — so
              the platform stays free for anyone who needs blood.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            <Reveal delay={0.05} duration={0.7}>
              <div className="h-full rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-blood text-white">
                    <Wallet size={19} strokeWidth={1.9} />
                  </span>
                  <h3 className="font-display text-lg font-bold tracking-tight text-white">
                    Mobile Wallets
                  </h3>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {WALLETS.map((w) => (
                    <div
                      key={`${w.name}-${w.number}`}
                      className="rounded-xl bg-white/[0.06] p-4 transition-colors hover:bg-white/[0.09]"
                    >
                      <span className="flex items-center gap-2">
                        <Smartphone size={14} className="text-blood" />
                        <span className="text-sm font-semibold text-white">{w.name}</span>
                      </span>
                      <p className="mt-1 font-mono text-sm text-white/60">{w.number}</p>
                      <p className="mt-0.5 text-xs text-white/40">{w.holder}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.12} duration={0.7}>
              <div className="h-full rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-blood text-white">
                    <Building2 size={19} strokeWidth={1.9} />
                  </span>
                  <h3 className="font-display text-lg font-bold tracking-tight text-white">
                    Bank Accounts
                  </h3>
                </div>
                <ul className="mt-6 space-y-3">
                  {BANKS.map((b) => (
                    <li
                      key={b.name}
                      className="rounded-xl bg-white/[0.06] p-4 transition-colors hover:bg-white/[0.09]"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-bold text-white">{b.name}</p>
                        {b.available ? (
                          <p className="text-xs text-white/40">{b.holder}</p>
                        ) : (
                          <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white/50">
                            Temporarily unavailable
                          </span>
                        )}
                      </div>
                      <p className="mt-1 font-mono text-sm text-white/60">
                        {b.available ? b.number : "Bank transfers are currently paused."}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.18} className="mt-6">
            <div className="flex items-start gap-3 rounded-2xl border border-blood/25 bg-blood/10 p-4">
              <Info size={18} className="mt-0.5 shrink-0 text-blood" />
              <p className="text-[14px] leading-relaxed text-white/70">
                After sending your payment, share the screenshot on{" "}
                <a
                  href="https://wa.me/923424772492"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-blood underline underline-offset-2 hover:text-white"
                >
                  WhatsApp
                </a>{" "}
                so we can confirm and share a receipt. Every contribution is transparent.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24 md:px-10 md:py-28">
        <SectionHeading
          eyebrow="FAQ"
          title="Common questions, straight answers"
          lede="Everything people usually ask before their first donation."
        />
        <Reveal className="mt-12">
          <div className="mx-auto max-w-3xl space-y-4">
            {FAQS.map((faq) => (
              <details
                key={faq.q}
                className="group rounded-2xl border border-fog bg-white p-6 open:shadow-[0_20px_60px_-30px_rgba(10,10,10,0.25)]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-base font-bold tracking-tight text-ink [&::-webkit-details-marker]:hidden">
                  {faq.q}
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blush text-blood transition-transform duration-300 group-open:rotate-45">
                    <Plus size={16} />
                  </span>
                </summary>
                <p className="mt-4 text-[15px] leading-relaxed text-mute">{faq.a}</p>
              </details>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="px-6 pb-8 md:px-10">
        <Reveal className="mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-ink px-6 py-16 text-center sm:px-12">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-blood/15">
            <DropGlyph className="text-blood" size={22} />
          </span>
          <h2 className="mx-auto mt-6 max-w-2xl text-balance font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Your blood type is already <span className="text-blood">someone&rsquo;s answer</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/60">
            Register as a donor in five minutes. When a request in your area matches your type,
            we&rsquo;ll let you know — and you decide from there.
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
              href="/find-a-donor"
              className="rounded-full border border-white/20 px-7 py-3.5 text-sm font-semibold text-white/80 hover:border-white/50 hover:text-white"
            >
              I need blood instead
            </MagneticButton>
          </div>
        </Reveal>
      </section>
    </main>
  );
}