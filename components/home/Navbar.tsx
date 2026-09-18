"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
} from "framer-motion";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  X,
} from "lucide-react";
import DropGlyph from "@/components/ui/DropGlyph";
import { cn } from "@/lib/cn";
import { useSession } from "@/lib/use-session";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Find Donor", href: "/find-a-donor" },
  { label: "Our Mission", href: "/about" },
  { label: "Donation", href: "/donation" },
];

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export default function Navbar() {
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    mass: 0.4,
  });
  const reduce = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { user, loading, logout } = useSession();

  useEffect(() => {
    const unsub = scrollY.on("change", (v) => setScrolled(v > 24));
    return unsub;
  }, [scrollY]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const dashboardHref = user?.role === "ADMIN" ? "/admin" : "/dashboard";

  return (
    <>
      <motion.div
        className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-blood"
        style={{ scaleX: progress }}
        aria-hidden="true"
      />

      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          scrolled
            ? "border-b border-fog bg-white/80 backdrop-blur-md"
            : "border-b border-transparent bg-transparent"
        )}
      >
        <nav
          className={cn(
            "mx-auto flex items-center justify-between px-6 md:px-10 transition-all duration-300",
            scrolled ? "max-w-6xl h-16" : "max-w-7xl h-[76px]"
          )}
        >
          <Link
            href="/"
            onClick={() => {
              setOpen(false);
              setMenuOpen(false);
            }}
            className="flex items-center gap-2"
          >
            <DropGlyph className="text-blood" size={16} />
            <span className="text-[19px] font-bold tracking-tight text-ink font-display">
              Donate the <span className="text-blood">Blood</span>
            </span>
          </Link>

          <div className="hidden items-center gap-9 lg:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "group relative text-sm font-medium transition-colors",
                  pathname === link.href ? "text-ink" : "text-ink/70 hover:text-ink"
                )}
              >
                {link.label}
                <span
                  className={cn(
                    "absolute -bottom-1.5 left-0 h-[2px] w-full origin-left rounded-full bg-blood transition-transform duration-300 ease-out",
                    pathname === link.href ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  )}
                />
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            {loading ? (
              <span className="h-9 w-9 animate-pulse rounded-full bg-fog" />
            ) : user ? (
              <div ref={menuRef} className="relative">
                <button
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen((m) => !m)}
                  className="flex items-center gap-2 rounded-full border border-ink/10 bg-white py-1.5 pl-1.5 pr-3 transition-colors hover:border-blood/40"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-ink text-xs font-bold text-white">
                    {initials(user.name)}
                  </span>
                  <span className="max-w-[110px] truncate text-sm font-semibold text-ink">
                    {user.name.split(" ")[0]}
                  </span>
                  <ChevronDown
                    size={14}
                    className={cn("text-mute transition-transform", menuOpen && "rotate-180")}
                  />
                </button>

                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      role="menu"
                      initial={reduce ? false : { opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduce ? undefined : { opacity: 0, y: 6 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-52 overflow-hidden rounded-2xl border border-fog bg-white shadow-xl"
                    >
                      <div className="border-b border-fog px-4 py-3">
                        <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
                        <p className="truncate text-xs text-mute">{user.role.toLowerCase()}</p>
                      </div>
                      <div className="p-1.5">
                        {user.role === "ADMIN" ? (
                          <Link
                            href={dashboardHref}
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-smoke"
                          >
                            <ShieldCheck size={16} className="text-blood" />
                            Admin panel
                          </Link>
                        ) : (
                          <Link
                            href={dashboardHref}
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-smoke"
                          >
                            <LayoutDashboard size={16} className="text-blood" />
                            Dashboard
                          </Link>
                        )}
                        <button
                          type="button"
                          onClick={() => void logout()}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-smoke"
                        >
                          <LogOut size={16} className="text-mute" />
                          Log out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-full text-sm font-semibold text-ink/70 transition-colors hover:text-ink"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center rounded-full bg-blood px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_-10px_rgba(217,28,43,0.7)] transition-colors hover:bg-blood-deep"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={reduce ? false : { height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={reduce ? undefined : { height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden border-b border-fog bg-white/95 backdrop-blur-md lg:hidden"
            >
              <div className="flex flex-col gap-1 px-6 py-4">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "rounded-xl px-3 py-3 text-base font-medium transition-colors hover:bg-smoke",
                      pathname === link.href ? "text-blood" : "text-ink/80 hover:text-ink"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}

                {user && (
                  <>
                    <Link
                      href={dashboardHref}
                      onClick={() => setOpen(false)}
                      className="rounded-xl px-3 py-3 text-base font-medium text-ink/80 transition-colors hover:bg-smoke hover:text-ink"
                    >
                      {user.role === "ADMIN" ? "Admin panel" : "Dashboard"}
                    </Link>
                    <button
                      type="button"
                      onClick={() => void logout()}
                      className="rounded-xl px-3 py-3 text-left text-base font-medium text-ink/80 transition-colors hover:bg-smoke hover:text-ink"
                    >
                      Log out
                    </button>
                  </>
                )}

                {!user && !loading && (
                  <div className="mt-2 flex gap-2">
                    <Link
                      href="/login"
                      onClick={() => setOpen(false)}
                      className="inline-flex flex-1 items-center justify-center rounded-full border border-ink/15 px-5 py-3 text-sm font-semibold text-ink"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setOpen(false)}
                      className="inline-flex flex-1 items-center justify-center rounded-full bg-blood px-5 py-3 text-sm font-semibold text-white"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}