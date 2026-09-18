"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Field, SubmitButton, textInputClass } from "@/components/ui/FormInputs";

function ResetPasswordFormInner() {
  const params = useSearchParams();
  const errorParam = params.get("error");
  const code = params.get("code") ?? params.get("token");
  const emailFromUrl = params.get("email") ?? "";

  const [invalid, setInvalid] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [issues, setIssues] = useState<Record<string, string>>({});
  const [values, setValues] = useState({ email: emailFromUrl, password: "", confirm: "" });

  // The reset link from the backend should carry a one-time code/token.
  // If it's missing, this page is only reachable via the email link.
  const ready = Boolean(code) && !invalid;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const nextIssues: Record<string, string> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      nextIssues.email = "Enter a valid email address";
    }
    if (values.password.length < 8) {
      nextIssues.password = "Password must be at least 8 characters";
    }
    if (values.confirm !== values.password) {
      nextIssues.confirm = "Passwords don't match";
    }
    setIssues(nextIssues);
    if (Object.keys(nextIssues).length > 0) return;

    if (!code) {
      setInvalid(true);
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: values.email.trim(),
          otp: code,
          newPassword: values.password,
        }),
        cache: "no-store",
      });
      const data = (await res.json().catch(() => null)) as {
        error?: string;
        message?: string;
      } | null;

      if (!res.ok) {
        if (res.status === 400 || res.status === 401 || res.status === 422) {
          setFormError(
            data?.message ?? data?.error ?? "Reset link is invalid or has expired."
          );
          setInvalid(true);
          return;
        }
        setFormError(
          data?.message ?? data?.error ?? "Password update failed. Please try again."
        );
        return;
      }

      setDone(true);
    } catch {
      setFormError("Network error — please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="text-center">
        <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10">
          <svg
            className="text-emerald-600"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <path d="m9 11 3 3L22 4" />
          </svg>
        </span>
        <h2 className="mt-5 font-display text-2xl font-bold tracking-tight text-ink">
          Password updated
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-mute">
          Your password has been changed. Log in with your new password.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-blood px-6 text-[15px] font-semibold text-white shadow-[0_14px_32px_-12px_rgba(217,28,43,0.8)] transition-colors hover:bg-blood-deep"
        >
          Log in with new password
        </Link>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="text-center">
        <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blood/10">
          <svg
            className="text-blood"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </span>
        <h2 className="mt-5 font-display text-2xl font-bold tracking-tight text-ink">
          {errorParam ? "Link Expired" : "Invalid Link"}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-mute">
          {errorParam
            ? "The password reset link is invalid or has expired."
            : "The password reset link was never provided. This page can only be accessed via a reset link."}
        </p>
        <Link
          href="/forgot-password"
          className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-blood px-6 text-[15px] font-semibold text-white shadow-[0_14px_32px_-12px_rgba(217,28,43,0.8)] transition-colors hover:bg-blood-deep"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <Field
        label="Email"
        htmlFor="rp-email"
        error={issues.email}
        hint="The email address you registered with."
      >
        <input
          id="rp-email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={(e) => {
            setValues((v) => ({ ...v, email: e.target.value }));
            setIssues((prev) => ({ ...prev, email: "" }));
          }}
          className={textInputClass(Boolean(issues.email))}
          placeholder="you@example.com"
        />
      </Field>

      <Field
        label="New password"
        htmlFor="rp-pass"
        error={issues.password}
        hint="At least 8 characters — avoid common words like your email or phone number."
      >
        <input
          id="rp-pass"
          type="password"
          autoComplete="new-password"
          value={values.password}
          onChange={(e) => {
            setValues((v) => ({ ...v, password: e.target.value }));
            setIssues((prev) => ({ ...prev, password: "" }));
          }}
          className={textInputClass(Boolean(issues.password))}
          placeholder="••••••••"
        />
      </Field>

      <Field label="Confirm password" htmlFor="rp-confirm" error={issues.confirm}>
        <input
          id="rp-confirm"
          type="password"
          autoComplete="new-password"
          value={values.confirm}
          onChange={(e) => {
            setValues((v) => ({ ...v, confirm: e.target.value }));
            setIssues((prev) => ({ ...prev, confirm: "" }));
          }}
          className={textInputClass(Boolean(issues.confirm))}
          placeholder="••••••••"
        />
      </Field>

      {formError && (
        <div className="rounded-xl border border-blood/25 bg-blood/5 px-4 py-3 text-sm leading-relaxed text-blood-deep">
          {formError}
        </div>
      )}

      <SubmitButton busy={busy}>Update password</SubmitButton>
    </form>
  );
}

export default function ResetPasswordForm() {
  return (
    <Suspense fallback={<div className="h-64" />}>
      <ResetPasswordFormInner />
    </Suspense>
  );
}