"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, KeyRound, Loader2, RotateCcw } from "lucide-react";
import DropGlyph from "@/components/ui/DropGlyph";
import { Field, SubmitButton, textInputClass } from "@/components/ui/FormInputs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Step = "email" | "otp" | "password" | "success";

interface ApiBody {
  success?: boolean;
  message?: string;
  error?: string;
  errors?: { field?: string; message?: string }[];
}

function extractError(data: ApiBody | null, fallback: string): string {
  if (typeof data?.message === "string" && data.message) return data.message;
  if (typeof data?.error === "string" && data.error) return data.error;
  if (Array.isArray(data?.errors) && data.errors[0]?.message) {
    return data.errors[0].message;
  }
  return fallback;
}

function otpError(data: ApiBody | null, fallback: string): string {
  const msg = extractError(data, fallback);
  if (/invalid|incorrect|expired|wrong|mismatch|not\s*(valid|match|found)|unrecognized/i.test(msg)) {
    return msg;
  }
  return fallback;
}

export default function ForgotPasswordForm() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [issues, setIssues] = useState<{
    email?: string;
    otp?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  // Cooldown for the Resend OTP button (30s from the last successful send).
  const cooldownActive = cooldown > 0;
  useEffect(() => {
    if (!cooldownActive) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldownActive]);

  // On success, show the confirmation briefly, then send the user to the login
  // page (the "Continue to login" button is kept as a manual fallback).
  const goToLogin = useCallback(() => {
    router.push("/login");
    router.refresh();
  }, [router]);

  useEffect(() => {
    if (step !== "success") return;
    const t = setTimeout(goToLogin, 2500);
    return () => clearTimeout(t);
  }, [step, goToLogin]);

  function startCooldown() {
    setCooldown(30);
  }

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const nextIssues: { email?: string } = {};
    if (!EMAIL_RE.test(email.trim())) {
      nextIssues.email = "Enter a valid email address";
    }
    setIssues(nextIssues);
    if (Object.keys(nextIssues).length > 0) return;

    setBusy(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = (await res.json().catch(() => null)) as ApiBody | null;

      if (!res.ok) {
        if (/invalid\s*email/i.test(extractError(data, ""))) {
          setIssues({ email: "Enter a valid email address" });
        } else {
          setFormError(
            data?.message ??
              data?.error ??
              "Something went wrong, please try again."
          );
        }
        return;
      }

      // The backend answers 200 even for unknown emails (anti-enumeration), so
      // we always move to the OTP step — real existence checks happen later.
      setNotice(null);
      setOtp("");
      startCooldown();
      setStep("otp");
    } catch {
      setFormError("Something went wrong, please try again.");
    } finally {
      setBusy(false);
    }
  }

  function goToPasswordStep(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const nextIssues: { otp?: string } = {};
    if (!/^\d{6}$/.test(otp.trim())) {
      nextIssues.otp = "Enter the 6-digit code from your email";
    }
    setIssues(nextIssues);
    if (Object.keys(nextIssues).length > 0) return;

    // There is no separate OTP-verify endpoint on the backend — the OTP is
    // validated together with the new password in the reset-password call.
    // So we only do the format check here and pass the OTP along to Step 3.
    setStep("password");
  }

  async function resendOtp() {
    if (cooldown > 0) return;
    setFormError(null);
    setResending(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as ApiBody | null;
        setFormError(data?.message ?? data?.error ?? "Couldn't resend the code. Try again.");
        return;
      }
      setOtp("");
      startCooldown();
      setNotice("A new 6-digit code has been sent to your email.");
    } catch {
      setFormError("Couldn't resend the code. Try again.");
    } finally {
      setResending(false);
    }
  }

  async function updatePassword(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const nextIssues: { newPassword?: string; confirmPassword?: string } = {};
    if (newPassword.length < 8) {
      nextIssues.newPassword = "Password must be at least 8 characters";
    }
    if (confirmPassword !== newPassword) {
      nextIssues.confirmPassword = "Passwords don't match";
    }
    setIssues(nextIssues);
    if (Object.keys(nextIssues).length > 0) return;

    setBusy(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          otp: otp.trim(),
          newPassword,
        }),
        cache: "no-store",
      });
      const data = (await res.json().catch(() => null)) as ApiBody | null;

      if (!res.ok) {
        const msg = extractError(data, "");
        const lower = msg.toLowerCase();

        // A "Donor not found" reply on reset means the email isn't registered —
        // route the user back to Step 1 so they can fix it.
        if (!res.ok && /donor\s*not\s*found/i.test(lower)) {
          setIssues({ email: "No account found with this email" });
          setStep("email");
          return;
        }

        // The OTP is verified by the backend as part of this call. If it
        // reports the code as invalid/expired, send the user back to Step 2
        // and surface the error there.
        if (/otp|code|pin/i.test(lower) && /invalid|incorrect|expired|wrong|mismatch|not\s*(valid|match|found)|unrecognized/i.test(lower)) {
          setIssues({ otp: otpError(data, "Invalid or expired OTP, please try again") });
          setStep("otp");
          return;
        }

        // Field-level validation details from the backend (e.g. too-weak
        // password) — because the messages are field-prefixed we look at the
        // errors array when present.
        if (Array.isArray(data?.errors) && data.errors.length > 0) {
          const errMap: Record<string, string> = {};
          for (const err of data.errors) {
            if (err.field && err.message) errMap[err.field] = err.message;
          }
          if (errMap.newPassword) {
            setIssues({ newPassword: errMap.newPassword });
            return;
          }
        }

        if (/password/i.test(lower) && /at\s*least|too\s*weak|weak|character/i.test(lower)) {
          setIssues({ newPassword: msg });
          return;
        }

        setFormError(msg || "Password update failed. Please try again.");
        return;
      }

      // Clear the wizard state and show the success screen.
      setEmail("");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
      setIssues({});
      setNotice(null);
      setStep("success");
    } catch {
      setFormError("Network error — please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (step === "success") {
    return (
      <div className="mt-10 rounded-3xl border border-fog bg-white p-6 shadow-[0_20px_60px_-30px_rgba(10,10,10,0.25)] sm:p-8">
        <div className="flex flex-col items-center py-6 text-center">
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
            <CheckCircle2 size={28} className="text-emerald-600" />
          </span>
          <h2 className="mt-5 font-display text-3xl font-bold tracking-tight text-ink">
            Password changed successfully
          </h2>
          <p className="mt-3 max-w-sm text-base leading-relaxed text-mute">
            Your password has been updated. You can now log in with your new
            password.
          </p>
          <Link
            href="/login"
            onClick={goToLogin}
            className="mt-8 inline-flex h-11 items-center rounded-full bg-blood px-6 text-sm font-semibold text-white shadow-[0_14px_32px_-12px_rgba(217,28,43,0.8)] transition-colors hover:bg-blood-deep"
          >
            Continue to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <header className="text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blood/10">
          {step === "email" ? (
            <DropGlyph className="text-blood" size={22} />
          ) : (
            <KeyRound size={22} className="text-blood" />
          )}
        </span>
        <h1 className="mt-5 font-display text-4xl font-bold tracking-tight text-ink md:text-5xl">
          {step === "email" && (
            <>
              Forgot your <span className="text-blood">password?</span>
            </>
          )}
          {step === "otp" && (
            <>
              Enter the <span className="text-blood">verification code</span>
            </>
          )}
          {step === "password" && (
            <>
              Set a <span className="text-blood">new password</span>
            </>
          )}
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-base leading-relaxed text-mute">
          {step === "email" &&
            "No worries. Enter your email and we'll send you a 6-digit code to set a fresh password."}
          {step === "otp" && (
            <>
              We&apos;ve sent a 6-digit code to{" "}
              <strong className="font-semibold text-ink">{email}</strong>. Enter
              it below to continue.
            </>
          )}
          {step === "password" &&
            "Choose a strong password for your account. It must be at least 8 characters."}
        </p>
      </header>

      <div className="mt-10 rounded-3xl border border-fog bg-white p-6 shadow-[0_20px_60px_-30px_rgba(10,10,10,0.25)] sm:p-8">
        {step === "email" && (
          <form onSubmit={sendOtp} noValidate className="space-y-5">
            <Field label="Email" htmlFor="fp-email" error={issues.email}>
              <input
                id="fp-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setIssues((prev) => ({ ...prev, email: undefined }));
                }}
                className={textInputClass(Boolean(issues.email))}
                placeholder="you@example.com"
              />
            </Field>

            {formError && (
              <div className="rounded-xl border border-blood/25 bg-blood/5 px-4 py-3 text-sm leading-relaxed text-blood-deep">
                {formError}
              </div>
            )}

            <SubmitButton busy={busy}>Send OTP</SubmitButton>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={goToPasswordStep} noValidate className="space-y-5">
            <Field
              label="Verification code"
              htmlFor="fp-otp"
              error={issues.otp}
              hint="6-digit code from the email"
            >
              <input
                id="fp-otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, ""));
                  setIssues((prev) => ({ ...prev, otp: undefined }));
                  setNotice(null);
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
                <CheckCircle2 size={16} className="shrink-0" />
                {notice}
              </div>
            )}

            <SubmitButton busy={busy}>Continue</SubmitButton>

            <div className="text-center text-sm text-mute">
              Didn&apos;t get the code?{" "}
              <button
                type="button"
                disabled={resending || cooldown > 0}
                onClick={() => void resendOtp()}
                className="inline-flex items-center gap-1.5 font-semibold text-blood transition-colors hover:text-blood-deep disabled:opacity-50"
              >
                {resending ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <RotateCcw size={13} />
                )}
                {cooldown > 0
                  ? `Resend code (${cooldown}s)`
                  : "Resend OTP"}
              </button>
            </div>

            <div className="flex items-center justify-center gap-1 text-sm text-mute">
              <span>Wrong email?</span>
              <button
                type="button"
                onClick={() => {
                  setFormError(null);
                  setIssues({});
                  setNotice(null);
                  setStep("email");
                }}
                className="font-semibold text-blood transition-colors hover:text-blood-deep"
              >
                Change email
              </button>
            </div>
          </form>
        )}

        {step === "password" && (
          <form onSubmit={updatePassword} noValidate className="space-y-5">
            <div>
              <span className="mb-1.5 block text-sm font-medium text-ink">Email</span>
              <div className="flex items-center gap-2.5 rounded-2xl border border-fog bg-smoke px-4 py-3 text-sm font-medium text-ink">
                <span className="truncate">{email}</span>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="New password"
                htmlFor="fp-password"
                error={issues.newPassword}
                hint="At least 8 characters"
              >
                <input
                  id="fp-password"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setIssues((prev) => ({ ...prev, newPassword: undefined }));
                  }}
                  className={textInputClass(Boolean(issues.newPassword))}
                  placeholder="At least 8 characters"
                />
              </Field>
              <Field
                label="Confirm new password"
                htmlFor="fp-confirm"
                error={issues.confirmPassword}
              >
                <input
                  id="fp-confirm"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setIssues((prev) => ({ ...prev, confirmPassword: undefined }));
                  }}
                  className={textInputClass(Boolean(issues.confirmPassword))}
                  placeholder="Repeat your password"
                />
              </Field>
            </div>

            {formError && (
              <div className="rounded-xl border border-blood/25 bg-blood/5 px-4 py-3 text-sm leading-relaxed text-blood-deep">
                {formError}
              </div>
            )}

            <SubmitButton busy={busy}>Reset password</SubmitButton>
          </form>
        )}
      </div>
    </div>
  );
}