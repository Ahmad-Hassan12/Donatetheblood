import type { Metadata } from "next";
import Link from "next/link";
import DropGlyph from "@/components/ui/DropGlyph";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Log In — Donate the Blood",
  description: "Log in to your Donate the Blood account to manage your donor profile, alerts, and requests.",
};



export default function LoginPage() {
  return (
    <main data-bg="light" className="min-h-svh bg-white pb-24 pt-28 md:pt-32">
      <div className="mx-auto max-w-md px-6">
        <header className="text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blood/10">
            <DropGlyph className="text-blood" size={22} />
          </span>
          <h1 className="mt-5 font-display text-4xl font-bold tracking-tight text-ink md:text-5xl">
            Welcome <span className="text-blood">back</span>
          </h1>
          <p className="mx-auto mt-4 max-w-sm text-base leading-relaxed text-mute">
            Log in to manage your profile, respond to alerts, or track the blood
            you&#39;ve given.
          </p>
        </header>

        <div className="mt-10 rounded-3xl border border-fog bg-white p-6 shadow-[0_20px_60px_-30px_rgba(10,10,10,0.25)] sm:p-8">
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-sm text-mute">
          Don&#39;t have an account?{" "}
          <Link href="/register" className="font-semibold text-blood transition-colors hover:text-blood-deep">
            Become a donor
          </Link>
        </p>
      </div>
    </main>
  );
}



