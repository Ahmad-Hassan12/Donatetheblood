import type { Metadata } from "next";
import Link from "next/link";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot Password — Donate the Blood",
  description:
    "Reset your Donate the Blood account password. We'll email you a secure OTP to set a new one.",
};

export default function ForgotPasswordPage() {
  return (
    <main data-bg="light" className="min-h-svh bg-white pb-24 pt-28 md:pt-32">
      <div className="mx-auto max-w-md px-6">
        <ForgotPasswordForm />

        <p className="mt-6 text-center text-sm text-mute">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-blood transition-colors hover:text-blood-deep"
          >
            Become a donor
          </Link>
        </p>
      </div>
    </main>
  );
}