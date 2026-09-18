"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Mail, MailCheck, ShieldCheck } from "lucide-react";
import { ApiError, apiClient, register as registerDonor, verifyOtp, resendOtp } from "@/lib/api";
import { unwrapUser } from "@/lib/use-session";
import { bloodGroupToBackend } from "@/lib/blood-group-map";
import type { BloodGroup } from "@/lib/search-types";
import { cn } from "@/lib/cn";
import BloodGroupSelector from "@/components/ui/BloodGroupSelector";
import { Field, SubmitButton, textInputClass } from "@/components/ui/FormInputs";

const CNIC_RE = /^\d{5}-\d{7}-\d{1}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[\d\s()-]{8,18}$/;

function formatCnic(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 13);
  if (digits.length <= 5) return digits;
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
}

function otpErrorMessage(err: unknown): string {
  const message = err instanceof ApiError && err.message ? err.message : "";
  const lower = message.toLowerCase();
  if (/expir/.test(lower)) {
    return "This code has expired. Please request a new one.";
  }
  if (/attempt/i.test(lower) && /too many|exceed|max/i.test(lower)) {
    return "Too many incorrect attempts. Please request a new code.";
  }
  // Never disguise a routing/config failure as "register again" — surface it.
  if (/route|endpoint|not configured|unreachable/.test(lower)) {
    return message || "Something went wrong. Please try again.";
  }
  if (/pending|register first|donor not found|not found/.test(lower)) {
    return "No pending registration was found for this email. Please register again.";
  }
  if (/invalid|incorrect|wrong|mismatch|does not match/.test(lower)) {
    return "The code you entered is incorrect.";
  }
  return message || "Something went wrong. Please try again.";
}

/** 6 single-digit boxes with auto-advance, backspace, paste and focus mgmt. */
function OtpField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  const setDigit = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, "").slice(-1);
    const chars = Array.from({ length: 6 }, (_, i) => value[i] ?? "");
    chars[index] = digit;
    onChange(chars.join("").slice(0, 6));
    if (digit && index < 5) refs.current[index + 1]?.focus();
  };

  const handleKeyDown =
    (index: number) => (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace") {
        e.preventDefault();
        const chars = Array.from({ length: 6 }, (_, i) => value[i] ?? "");
        if (chars[index]) {
          chars[index] = "";
          onChange(chars.join(""));
        } else if (index > 0) {
          chars[index - 1] = "";
          onChange(chars.join(""));
          refs.current[index - 1]?.focus();
        }
      } else if (e.key === "ArrowLeft" && index > 0) {
        e.preventDefault();
        refs.current[index - 1]?.focus();
      } else if (e.key === "ArrowRight" && index < 5) {
        e.preventDefault();
        refs.current[index + 1]?.focus();
      }
    };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!digits) return;
    onChange(digits);
    refs.current[Math.min(digits.length, 5)]?.focus();
  };

  return (
    <div className="flex justify-center gap-2.5">
      {Array.from({ length: 6 }, (_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={value[i] ?? ""}
          onChange={(e) => setDigit(i, e.target.value)}
          onKeyDown={handleKeyDown(i)}
          onPaste={handlePaste}
          aria-label={`Digit ${i + 1}`}
          className={cn(
            "h-12 w-10 rounded-xl border bg-white text-center text-xl font-semibold text-ink transition-[border-color,box-shadow] focus:outline-none focus:ring-2 sm:w-11",
            value[i]
              ? "border-blood/40 focus:border-blood focus:ring-blood/15"
              : "border-ink/15 focus:border-blood focus:ring-blood/15"
          )}
        />
      ))}
    </div>
  );
}

export default function RegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "otp" | "verified">("form");
  const [busy, setBusy] = useState(false);
  // Guards against a rapid second click submitting the same form twice
  // (setBusy(true) re-renders async, so disabled={busy} doesn't stop it).
  const submittingRef = useRef(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [issues, setIssues] = useState<Record<string, string>>({});
  const [values, setValues] = useState({
    fullName: "",
    phone: "",
    email: "",
    bloodGroup: null as BloodGroup | null,
    city: "",
    area: "",
    cnicNumber: "",
    password: "",
    confirmPassword: "",
  });

  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // If the user is already logged in, /register should send them to /dashboard.
  useEffect(() => {
    let cancelled = false;
    apiClient
      .get("/api/me")
      .then(async (res) => {
        if (res.status === 200 && !cancelled) {
          const user = unwrapUser(res.data);
          if (user?.id) router.replace("/dashboard");
        }
      })
      .catch(() => {
        // If /api/me fails, let the form render anyway.
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  // Resend countdown — ticks once per second until it hits zero.
  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  // After a successful verification, shortly send the user to log in.
  useEffect(() => {
    if (step !== "verified") return;
    const t = setTimeout(() => {
      router.push("/login");
      router.refresh();
    }, 2000);
    return () => clearTimeout(t);
  }, [step, router]);

  const set = (key: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = { ...values, [key]: e.target.value };
    if (key === "cnicNumber") next.cnicNumber = formatCnic(e.target.value);
    setValues(next);
    setIssues((prev) => ({ ...prev, [key]: "" }));
  };

  function validate(): boolean {
    const next: Record<string, string> = {};

    if (values.fullName.trim().length < 2) next.fullName = "Enter your full name";
    if (!PHONE_RE.test(values.phone)) next.phone = "Enter a valid phone number";
    if (!EMAIL_RE.test(values.email)) next.email = "Enter a valid email address";
    if (!values.bloodGroup) next.bloodGroup = "Select your blood group";
    if (!values.city.trim()) next.city = "Enter your city";
    if (!values.area.trim()) next.area = "Enter your area or neighborhood";
    if (!CNIC_RE.test(values.cnicNumber)) {
      next.cnicNumber = "Enter a valid CNIC like 42101-1234567-8";
    }
    if (values.password.length < 8) next.password = "Password must be at least 8 characters";
    if (values.confirmPassword !== values.password) {
      next.confirmPassword = "Passwords don't match";
    }

    setIssues(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submittingRef.current) return;
    setFormError(null);

    if (!validate()) return;

    submittingRef.current = true;
    setBusy(true);

    try {
      // The backend's /auth/register endpoint validates the data, stores a
      // pending registration and emails a 6-digit OTP — no account is created
      // until the code is verified via /auth/verify-otp.
      const payload = {
        fullName: values.fullName.trim(),
        phone: values.phone.trim(),
        email: values.email.trim(),
        cnicNumber: values.cnicNumber.trim(),
        password: values.password,
        bloodGroup: bloodGroupToBackend(values.bloodGroup) ?? "",
        city: values.city.trim(),
        area: values.area.trim(),
        agreedToTermsAt: new Date().toISOString().slice(0, 10),
      };

      await registerDonor(payload);

      setRegisteredEmail(values.email.trim());
      setOtp("");
      setOtpError(null);
      setNotice(null);
      setResendIn(60);
      setStep("otp");
    } catch (err) {
      if (err instanceof ApiError) {
        const msg = err.message;
        // Field-level conflicts from the backend (exact messages below).
        if (msg === "Donor with this email already exists") {
          setIssues({ email: msg });
          return;
        }
        if (msg === "Donor with this phone number already exists") {
          setIssues({ phone: msg });
          return;
        }
        if (msg === "Donor with this CNIC number already exists") {
          setIssues({ cnicNumber: msg });
          return;
        }
        // Backend validation details (e.g. "Invalid email address").
        if (err.issues && Object.keys(err.issues).length > 0) {
          setIssues(err.issues);
          return;
        }
        setFormError(
          err.status >= 500 || !msg
            ? "Something went wrong, please try again."
            : msg
        );
      } else {
        setFormError("Something went wrong, please try again.");
      }
    } finally {
      submittingRef.current = false;
      setBusy(false);
    }
  }

  async function onVerify(e: React.FormEvent) {
    e.preventDefault();
    if (otp.length < 6 || verifying) return;
    setVerifying(true);
    setOtpError(null);
    setNotice(null);
    try {
      await verifyOtp({ email: registeredEmail, otp });
      setOtp("");
      setStep("verified");
    } catch (err) {
      setOtpError(otpErrorMessage(err));
    } finally {
      setVerifying(false);
    }
  }

  async function onResend() {
    if (resending || resendIn > 0) return;
    setResending(true);
    setOtpError(null);
    setNotice(null);
    try {
      await resendOtp(registeredEmail);
      setOtp("");
      setNotice("A new code has been sent to your email.");
      setResendIn(60);
    } catch (err) {
      const message =
        err instanceof ApiError && err.message
          ? err.message
          : "Couldn't resend the code. Please try again.";
      setOtpError(message);
      const seconds = message.match(/(\d+)\s*second/);
      if (seconds) setResendIn(Number(seconds[1]));
    } finally {
      setResending(false);
    }
  }

  function goBackToForm() {
    setStep("form");
    setOtp("");
    setOtpError(null);
    setNotice(null);
  }

  if (step === "verified") {
    return (
      <div className="flex flex-col items-center py-6 text-center">
        <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
          <ShieldCheck size={28} className="text-emerald-600" />
        </span>
        <h2 className="mt-5 font-display text-3xl font-bold tracking-tight text-ink">
          Email verified! Your account is ready.
        </h2>
        <p className="mt-3 max-w-sm text-base leading-relaxed text-mute">
          After logging in, add your CNIC front, CNIC back and blood-group
          report from your dashboard to get verified.
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

  if (step === "otp") {
    return (
      <form onSubmit={onVerify} noValidate className="space-y-5">
        <div className="flex flex-col items-center text-center">
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-blood/10">
            <Mail size={28} className="text-blood" />
          </span>
          <h2 className="mt-5 font-display text-3xl font-bold tracking-tight text-ink">
            Verify your email
          </h2>
          <p className="mt-3 max-w-sm text-base leading-relaxed text-mute">
            We&#39;ve sent a 6-digit code to{" "}
            <span className="font-semibold text-ink">{registeredEmail}</span>.
            Enter it below to activate your account.
          </p>
        </div>

        <OtpField
          value={otp}
          onChange={(v) => {
            setOtp(v);
            setOtpError(null);
          }}
        />

        {otpError && (
          <div className="rounded-xl border border-blood/25 bg-blood/5 px-4 py-3 text-sm leading-relaxed text-blood-deep">
            {otpError}
          </div>
        )}

        {notice && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-relaxed text-emerald-800">
            <MailCheck size={16} className="shrink-0" />
            {notice}
          </div>
        )}

        <SubmitButton busy={verifying} disabled={otp.length < 6}>
          Verify
        </SubmitButton>

        <div className="flex items-center justify-center text-sm text-mute">
          Didn&apos;t get the code?{" "}
          <button
            type="button"
            disabled={resending || resendIn > 0}
            onClick={() => void onResend()}
            className="ml-1.5 inline-flex items-center gap-1.5 font-semibold text-blood transition-colors hover:text-blood-deep disabled:cursor-not-allowed disabled:opacity-50"
          >
            {resending && <Loader2 size={13} className="animate-spin" />}
            {resendIn > 0 ? `Resend code in ${resendIn}s` : "Resend code"}
          </button>
        </div>

        <p className="text-center text-sm text-mute">
          <button
            type="button"
            onClick={goBackToForm}
            className="font-semibold text-blood transition-colors hover:text-blood-deep"
          >
            Change email
          </button>
        </p>
      </form>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <Field label="Full name" htmlFor="rg-name" error={issues.fullName}>
        <input
          id="rg-name"
          type="text"
          autoComplete="name"
          value={values.fullName}
          onChange={set("fullName")}
          className={textInputClass(Boolean(issues.fullName))}
          placeholder="e.g. Ayesha Khan"
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Phone / WhatsApp" htmlFor="rg-phone" error={issues.phone}>
          <input
            id="rg-phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            value={values.phone}
            onChange={set("phone")}
            className={textInputClass(Boolean(issues.phone))}
            placeholder="0300 0000000"
          />
        </Field>
        <Field label="Email" htmlFor="rg-email" error={issues.email}>
          <input
            id="rg-email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={set("email")}
            className={textInputClass(Boolean(issues.email))}
            placeholder="you@example.com"
          />
        </Field>
      </div>

      <Field label="Blood group" error={issues.bloodGroup} hint="Donors are matched by blood group first.">
        <BloodGroupSelector
          value={values.bloodGroup}
          onChange={(g) => {
            setValues((v) => ({ ...v, bloodGroup: g }));
            setIssues((prev) => ({ ...prev, bloodGroup: "" }));
          }}
          allowClear={false}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="City" htmlFor="rg-city" error={issues.city}>
          <input
            id="rg-city"
            type="text"
            autoComplete="address-level2"
            value={values.city}
            onChange={set("city")}
            className={textInputClass(Boolean(issues.city))}
            placeholder="Karachi"
          />
        </Field>
        <Field label="Area / neighbourhood" htmlFor="rg-area" error={issues.area}>
          <input
            id="rg-area"
            type="text"
            autoComplete="address-line1"
            value={values.area}
            onChange={set("area")}
            className={textInputClass(Boolean(issues.area))}
            placeholder="Saddar, Clifton…"
          />
        </Field>
      </div>

      <Field
        label="CNIC number"
        htmlFor="rg-cnic-number"
        error={values.cnicNumber ? issues.cnicNumber : undefined}
        hint="Format: 42101-1234567-8"
      >
        <input
          id="rg-cnic-number"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={values.cnicNumber}
          onChange={set("cnicNumber")}
          className={textInputClass(Boolean(issues.cnicNumber))}
          placeholder="42101-1234567-8"
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Create a password" htmlFor="rg-password" error={issues.password}>
          <input
            id="rg-password"
            type="password"
            autoComplete="new-password"
            value={values.password}
            onChange={set("password")}
            className={textInputClass(Boolean(issues.password))}
            placeholder="At least 8 characters"
          />
        </Field>
        <Field label="Confirm password" htmlFor="rg-confirm" error={issues.confirmPassword}>
          <input
            id="rg-confirm"
            type="password"
            autoComplete="new-password"
            value={values.confirmPassword}
            onChange={set("confirmPassword")}
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

      <SubmitButton busy={busy}>Create my donor account</SubmitButton>
      <p className="text-center text-xs leading-relaxed text-mute">
        By registering you agree to be contacted when an urgent request for your
        blood group is raised near your area.
      </p>
    </form>
  );
}