import type { ReactNode } from "react";
import Link from "next/link";
import PageHero from "@/components/ui/PageHero";
import Reveal from "@/components/ui/Reveal";

export interface TocEntry {
  id: string;
  label: string;
}

interface LegalPageProps {
  eyebrow: string;
  title: ReactNode;
  subtitle: ReactNode;
  notice: ReactNode;
  updated: ReactNode;
  toc: TocEntry[];
  children: ReactNode;
}

export function LegalText({ children, lead }: { children: ReactNode; lead?: boolean }) {
  return (
    <p className={`text-base leading-8 text-mute ${lead ? "text-lg text-ink/70" : ""}`}>
      {children}
    </p>
  );
}

export function LegalSection({
  id,
  num,
  title,
  children,
}: {
  id: string;
  num: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
        <span className="mr-3 inline-block text-blood">{num}.</span>
        {title}
      </h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

export default function LegalPage({
  eyebrow,
  title,
  subtitle,
  notice,
  updated,
  toc,
  children,
}: LegalPageProps) {
  return (
    <main data-bg="light" className="min-h-svh bg-white pb-24">
      <section className="pt-28 pb-14 md:pt-36 md:pb-16">
        <div className="mx-auto max-w-3xl px-6 md:px-8">
          <Reveal>
            <div className="rounded-2xl border border-ink/15 bg-smoke px-5 py-4 text-sm leading-relaxed text-ink/80">
              {notice}
            </div>
          </Reveal>
        </div>

        <div className="mt-10">
          <PageHero eyebrow={eyebrow} title={title} subtitle={subtitle} />
          <p className="mt-6 text-center text-xs uppercase tracking-[0.16em] text-mute">
            Last updated: {updated}
          </p>
        </div>

        <Reveal delay={0.1} className="mt-8">
          <nav
            aria-label="On this page"
            className="mx-auto max-w-md rounded-2xl border border-fog bg-smoke/60 p-5"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mute">
              On this page
            </p>
            <ol className="mt-3 space-y-2.5">
              {toc.map((t, i) => (
                <li key={t.id}>
                  <a
                    href={`#${t.id}`}
                    className="group flex items-baseline gap-2 text-sm text-ink/80 transition-colors hover:text-blood"
                  >
                    <span className="font-display text-xs font-bold text-blood">{i + 1}.</span>
                    {t.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </Reveal>
      </section>

      <div className="mx-auto max-w-3xl px-6 md:px-8">
        <div className="space-y-14">{children}</div>

        <Reveal className="mt-16">
          <div className="rounded-2xl border border-fog bg-smoke/60 p-6 text-center">
            <p className="font-display text-lg font-bold text-ink">Still have questions?</p>
            <p className="mt-1 text-sm text-mute">We&rsquo;re happy to talk it through.</p>
            <Link
              href="/contact"
              className="mt-4 inline-flex items-center justify-center rounded-full bg-blood px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blood-deep"
            >
              Contact us
            </Link>
          </div>
        </Reveal>
      </div>
    </main>
  );
}