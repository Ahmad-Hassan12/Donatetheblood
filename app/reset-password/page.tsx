import type { Metadata } from "next";
import Link from "next/link";
import DropGlyph from "@/components/ui/DropGlyph";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset Password — Donate the Blood",
  description:
    "Set a new password for your Donate the Blood account.",
  other: {
    referrer: "no-referrer",
  },
};

export default function ResetPasswordPage() {
  return (
    <main data-bg="light" className="min-h-svh bg-white pb-24 pt-28 md:pt-32">
      <div className="mx-auto max-w-md px-6">
        <header className="text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blood/10">
            <DropGlyph className="text-blood" size={22} />
          </span>
          <h1 className="mt-5 font-display text-4xl font-bold tracking-tight text-ink md:text-5xl">
            Set a new <span className="text-blood">password</span>
          </h1>
          <p className="mx-auto mt-4 max-w-sm text-base leading-relaxed text-mute">
            Choose a fresh password for your account. Make sure it&apos;s strong
            and unique.
          </p>
        </header>

        <div className="mt-10 rounded-3xl border border-fog bg-white p-6 shadow-[0_20px_60px_-30px_rgba(10,10,10,0.25)] sm:p-8">
          <ResetPasswordForm />
        </div>

        <p className="mt-6 text-center text-sm text-mute">
          Need a new link?{" "}
          <Link
            href="/forgot-password"
            className="font-semibold text-blood transition-colors hover:text-blood-deep"
          >
            Request one
          </Link>
        </p>
      </div>
    </main>
  );
}