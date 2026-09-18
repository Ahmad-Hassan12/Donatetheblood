"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Mail, MailCheck, ShieldCheck } from "lucide-react";
import { verifyEmail, resendVerification } from "@/lib/app-api";
import { Field, SubmitButton, textInputClass } from "@/components/ui/FormInputs";

function VerifyEmailFormInner() {
  const router = useRouter();
  const params = useSearchParams();
  const prefilled = params.get("email") ?? "";

  const [email] = useState(prefilled);
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);
  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [issues, setIssues] = useState<{ email?: string; otp?: string }>({});

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const nextIssues: { email?: string; otp?: string } = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextIssues.email = "Enter a valid email address";
    }
    if (!/^\d{6}$/.test(otp.trim()))
      nextIssues.otp = "Enter the 6-digit code from your email";
    setIssues(nextIssues);
    if (Object.keys(nextIssues).length > 0) return;

    setBusy(true);
    try {
      await verifyEmail({ email: email.trim(), otp: otp.trim() });
      setDone(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Verification failed. Try again.";
      if (/invalid\s*otp/i.test(message)) {
        setIssues((prev) => ({ ...prev, otp: "Invalid OTP" }));
      } else {
        setFormError(message);
      }
    } finally {
      setBusy(false);
    }
  }

  // On success, show the confirmation briefly, then send the user to the login
  // page (the "Go to log in" button below is kept as a manual fallback).
  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => {
      router.push("/login");
      router.refresh();
    }, 2000);
    return () => clearTimeout(t);
  }, [done, router]);

  async function resend() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setIssues({ email: "Enter a valid email address" });
      return;
    }
    setFormError(null);
    setResending(true);
    try {
      await resendVerification(email.trim());
      setNotice("A new verification code has been sent to your email.");
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Couldn't resend the code. Try again."
      );
    } finally {
      setResending(false);
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center py-6 text-center">
        <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
          <ShieldCheck size={28} className="text-emerald-600" />
        </span>
        <h2 className="mt-5 font-display text-3xl font-bold tracking-tight text-ink">
          Email verified successfully
        </h2>
        <p className="mt-3 max-w-sm text-base leading-relaxed text-mute">
          Your email is confirmed and your donor account is active. Log in to
          complete your profile and turn on availability.
        </p>
        <Link
          href="/login"
          className="mt-8 inline-flex h-11 items-center rounded-full bg-blood px-6 text-sm font-semibold text-white transition-colors hover:bg-blood-deep"
        >
          Go to log in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div>
        <span className="mb-1.5 block text-sm font-medium text-ink">Email</span>
        <div className="flex items-center gap-2.5 rounded-2xl border border-fog bg-smoke px-4 py-3 text-sm font-medium text-ink">
          <Mail size={16} className="shrink-0 text-mute" />
          <span className="truncate">{email}</span>
        </div>
        <p className="mt-1.5 text-xs text-mute">
          We sent a verification code to this address.
        </p>
      </div>

      <Field
        label="Verification code"
        htmlFor="ve-otp"
        error={issues.otp}
        hint="We emailed a 6-digit code to this address."
      >
        <input
          id="ve-otp"
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={otp}
          onChange={(e) => {
            setOtp(e.target.value.replace(/\D/g, ""));
            setIssues((prev) => ({ ...prev, otp: undefined }));
          }}
          className={textInputClass(Boolean(issues.otp))}
          placeholder="6-digit code"
        />
      </Field>

      {formError && (
        <div className="rounded-xl border border-blood/25 bg-blood/5 px-4 py-3 text-sm leading-relaxed text-blood-deep">
          {formError}
        </div>
      )}

      {notice && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-relaxed text-emerald-800">
          <MailCheck size={16} className="shrink-0" />
          {notice}
        </div>
      )}

      <SubmitButton busy={busy}>Verify email</SubmitButton>

      <div className="text-center text-sm text-mute">
        Didn&apos;t get the code?{" "}
        <button
          type="button"
          disabled={resending}
          onClick={() => void resend()}
          className="inline-flex items-center gap-1.5 font-semibold text-blood transition-colors hover:text-blood-deep disabled:opacity-50"
        >
          {resending && <Loader2 size={13} className="animate-spin" />}
          Resend code
        </button>
      </div>

      <p className="text-center text-sm text-mute">
        <Link
          href="/login"
          className="font-semibold text-blood transition-colors hover:text-blood-deep"
        >
          Back to login
        </Link>
      </p>
    </form>
  );
}

export default function VerifyEmailForm() {
  return (
    <Suspense fallback={<div className="h-64" />}>
      <VerifyEmailFormInner />
    </Suspense>
  );
}