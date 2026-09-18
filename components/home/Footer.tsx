import Link from "next/link";
import { AtSign, MessageCircle, Globe, Mail } from "lucide-react";
import DropGlyph from "@/components/ui/DropGlyph";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Find a Donor", href: "/find-a-donor" },
      { label: "Become a Donor", href: "/register" },
      { label: "Donation", href: "/donation" },
      { label: "Login", href: "/login" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/#about" },
      { label: "Our Mission", href: "/about" },
      { label: "Partners", href: "/partners" },
      { label: "Careers", href: "/careers" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

const SOCIALS = [
  { icon: AtSign, label: "Community", href: "/" },
  { icon: MessageCircle, label: "Chat", href: "/" },
  { icon: Globe, label: "Website", href: "/" },
  { icon: Mail, label: "Email", href: "/" },
];

export default function Footer() {
  return (
    <footer data-bg="light" className="border-t border-fog bg-white">
      <div className="relative z-10 mx-auto max-w-6xl px-6 py-16 md:px-10 md:py-20">
        <div className="grid grid-cols-2 gap-12 md:grid-cols-5">
          <div className="col-span-2">
            <Link href="#top" className="flex items-center gap-2">
              <DropGlyph className="text-blood" size={16} />
              <span className="text-[19px] font-bold tracking-tight text-ink font-display">
                Donate the <span className="text-blood">Blood</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-mute">
              One connection can restart a heartbeat. A community of donors,
              ready when it matters most.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink">
                {col.title}
              </h3>
              <ul className="mt-5 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-mute transition-colors hover:text-blood"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-6 border-t border-fog pt-8 md:flex-row md:items-center">
          <p className="text-xs text-mute">
            © 2026 Donate the Blood. Made in collaboration with donors who show up.
          </p>
          <div className="flex items-center gap-2">
            {SOCIALS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="flex h-10 w-10 items-center justify-center rounded-full text-mute transition-colors hover:bg-smoke hover:text-blood"
              >
                <social.icon size={17} />
              </a>
            ))}
          </div>
        </div>

        <p className="mt-6 text-[11px] leading-relaxed text-mute/80">
          Donate the Blood is a community matching platform, not a medical service.
          In an emergency, always contact your local emergency services first.
        </p>
      </div>
    </footer>
  );
}