"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ApiError, apiClient, login } from "@/lib/api";
import { Field, SubmitButton, textInputClass } from "@/components/ui/FormInputs";

function LoginFormInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next");

  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [issues, setIssues] = useState<Record<string, string>>({});
  const [values, setValues] = useState({ email: "", password: "" });

  const go = (to?: string | null) => {
    const target = to && to.startsWith("/") ? to : "/dashboard";
    router.push(target);
    router.refresh();
  };

  // If the user is already logged in, /login should send them to /dashboard.
  useEffect(() => {
    let cancelled = false;
    apiClient
      .get("/api/me")
      .then(async (res) => {
        const data = res.data as {
          data?: { user?: { id?: string }; donor?: { id?: string }; id?: string };
          user?: { id?: string };
        } | null;
        // The profile payload carries the donor id at `data.id`.
        const wallet =
          data?.data?.user ??
          data?.data?.donor ??
          (data?.data?.id ? data.data : null) ??
          data?.user;
        if (res.status === 200 && wallet?.id && !cancelled) go(next);
      })
      .catch(() => {
        // If /api/me fails, let the form render anyway.
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const nextIssues: Record<string, string> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      nextIssues.email = "Enter a valid email address";
    }
    if (!values.password) nextIssues.password = "Enter your password";
    setIssues(nextIssues);
    if (Object.keys(nextIssues).length > 0) return;

    setBusy(true);
    try {
      await login({ email: values.email.trim(), password: values.password });
      go(next);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message || "Login failed. Please check your email and password."
          : "Login failed. Please try again.";
      setFormError(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <Field label="Email" htmlFor="lg-email" error={issues.email}>
        <input
          id="lg-email"
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

      <Field label="Password" htmlFor="lg-pass" error={issues.password}>
        <input
          id="lg-pass"
          type="password"
          autoComplete="current-password"
          value={values.password}
          onChange={(e) => {
            setValues((v) => ({ ...v, password: e.target.value }));
            setIssues((prev) => ({ ...prev, password: "" }));
          }}
          className={textInputClass(Boolean(issues.password))}
          placeholder="••••••••"
        />
      </Field>

      <div className="flex justify-end">
        <Link
          href="/forgot-password"
          className="text-sm font-medium text-blood transition-colors hover:text-blood-deep"
        >
          Forgot password?
        </Link>
      </div>

      {formError && (
        <div className="rounded-xl border border-blood/25 bg-blood/5 px-4 py-3 text-sm leading-relaxed text-blood-deep">
          {formError}{" "}
          <Link
            href="/register"
            className="font-semibold underline underline-offset-2 decoration-blood/40 transition-colors hover:decoration-blood"
          >
            Sign up
          </Link>
        </div>
      )}

      <SubmitButton busy={busy}>Log in</SubmitButton>
    </form>
  );
}

export default function LoginForm() {
  return (
    <Suspense fallback={<div className="h-64" />}>
      <LoginFormInner />
    </Suspense>
  );
}