import type { Metadata } from "next";
import Link from "next/link";
import DropGlyph from "@/components/ui/DropGlyph";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Become a Donor — Donate the Blood",
  description:
    "Join the Donate the Blood donor network. Sign up in five minutes and be found by someone who needs your blood group.",
};

export default function RegisterPage() {
  return (
    <main data-bg="light" className="min-h-svh bg-white pb-24 pt-28 md:pt-32">
      <div className="mx-auto max-w-xl px-6">
        <header className="text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blood/10">
            <DropGlyph className="text-blood" size={22} />
          </span>
          <h1 className="mt-5 text-balance font-display text-4xl font-bold tracking-tight text-ink md:text-5xl">
            Blood <span className="text-blood">Donor</span> Registration
          </h1>
          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-mute">
            Add your profile in about five minutes. When someone near you needs
            your blood group, we&#39;ll match you and reach out.
          </p>
        </header>

        <div className="mt-10 rounded-3xl border border-fog bg-white p-6 shadow-[0_20px_60px_-30px_rgba(10,10,10,0.25)] sm:p-8">
          <RegisterForm />
        </div>

        <p className="mt-6 text-center text-sm text-mute">
          Already registered?{" "}
          <Link href="/login" className="font-semibold text-blood transition-colors hover:text-blood-deep">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}