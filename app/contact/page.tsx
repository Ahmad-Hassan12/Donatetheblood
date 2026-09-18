import { AtSign, Clock, Globe, Mail, MessageCircle, Droplets } from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import Reveal from "@/components/ui/Reveal";
import ContactForm from "@/components/contact/ContactForm";

export const dynamic = "force-dynamic";

const SOCIALS = [
  { label: "Email", icon: Mail, href: "mailto:donatetheblood@kivrosolutions.com" },
  { label: "X / Twitter", icon: AtSign, href: "#" },
  { label: "WhatsApp Community", icon: MessageCircle, href: "#" },
  { label: "Facebook", icon: Globe, href: "#" },
];

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string }>;
}) {
  const { subject } = await searchParams;

  return (
    <main data-bg="light" className="min-h-svh bg-white pb-24">
      <section className="pt-28 pb-14 md:pt-36 md:pb-16">
        <PageHero
          eyebrow="Contact"
          title="Talk to us"
          subtitle={
            <>
              Questions, feedback, or a partnership in mind — we&rsquo;re one simple form away.
              We try to reply within a couple of days.
            </>
          }
        />
      </section>

      <div className="mx-auto grid max-w-6xl gap-10 px-6 md:px-10 lg:grid-cols-[1fr_340px] lg:gap-12">
        <Reveal direction="left">
          <ContactForm initialSubject={subject} />
        </Reveal>

        <Reveal direction="right" delay={0.1} className="lg:sticky lg:top-28 lg:h-fit">
          <div className="space-y-4" aria-label="Contact details">
            <div className="rounded-3xl bg-ink p-6 text-white">
              <h2 className="font-display text-lg font-bold">Reach us directly</h2>
              <ul className="mt-4 space-y-4 text-sm text-white/70">
                <li className="flex gap-3">
                  <Mail size={17} className="mt-0.5 shrink-0 text-blood" />
                  <span>
                    <span className="block font-semibold text-white">Email</span>
                    donatetheblood@kivrosolutions.com
                  </span>
                </li>
                <li className="flex gap-3">
                  <Clock size={17} className="mt-0.5 shrink-0 text-blood" />
                  <span>
                    <span className="block font-semibold text-white">Response time</span>
                    Usually within 2 days
                  </span>
                </li>
              </ul>

              <div className="mt-6 flex flex-wrap gap-2">
                {SOCIALS.map(({ label, icon: Icon, href }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="grid h-9 w-9 place-items-center rounded-full bg-white/5 text-white/60 transition-colors hover:bg-blood hover:text-white"
                  >
                    <Icon size={15} />
                  </a>
                ))}
              </div>

              <p className="mt-5 flex items-start gap-2 rounded-xl bg-white/5 p-3 text-xs leading-relaxed text-white/50">
                <Droplets size={14} className="mt-0.5 shrink-0 text-blood" />
                In a medical emergency, always call local emergency services first. This form is
                for non-emergency enquiries.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </main>
  );
}