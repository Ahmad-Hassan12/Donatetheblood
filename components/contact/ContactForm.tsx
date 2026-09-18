"use client";

import { useState } from "react";
import { contactSchema, CONTACT_SUBJECTS } from "@/lib/schemas";
import type { ContactSubject, ContactValues } from "@/lib/schemas";
import { zodFieldIssues } from "@/lib/zod-issues";
import { Field, SubmitButton, textInputClass } from "@/components/ui/FormInputs";
import { CheckCircle2, Send } from "lucide-react";
import { cn } from "@/lib/cn";

const SUBJECT_LOOKUP: Record<string, ContactSubject> = {
  general: "general",
  partnership: "partnership",
  careers: "careers",
  support: "support",
  privacy: "privacy",
};

export default function ContactForm({ initialSubject }: { initialSubject?: string }) {
  const [values, setValues] = useState({
    name: "",
    email: "",
    subject: (SUBJECT_LOOKUP[initialSubject ?? ""] ?? "general") as ContactSubject,
    message: "",
  });
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [issues, setIssues] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  function setField<K extends keyof ContactValues>(key: K, value: ContactValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    setIssues((p) => ({ ...p, [key]: "" }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const parsed = contactSchema.safeParse(values);
    if (!parsed.success) {
      setIssues(zodFieldIssues(parsed.error));
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
        cache: "no-store",
      });
      const data = (await res.json()) as { error?: string; issues?: Record<string, string> };
      if (!res.ok) {
        setFormError(data.error ?? "Couldn't send the message. Please try again.");
        setIssues(data.issues ?? {});
        return;
      }
      setSubmitted(true);
    } catch {
      setFormError("Network error — please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-3xl border border-fog bg-white p-8 text-center shadow-[0_20px_60px_-30px_rgba(10,10,10,0.25)]">
        <span className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-blood/10">
          <CheckCircle2 size={32} className="text-blood" />
        </span>
        <h2 className="mt-6 font-display text-3xl font-bold tracking-tight text-ink">
          Message <span className="text-blood">sent</span>
        </h2>
        <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-mute">
          Thanks for reaching out — we&#39;ve received your message and will get back to you as
          soon as we can.
        </p>
        <button
          type="button"
          onClick={() => {
            setSubmitted(false);
            setValues({ name: "", email: "", subject: "general", message: "" });
          }}
          className="mt-8 inline-flex items-center justify-center rounded-full border border-ink/15 bg-white px-7 py-3 text-sm font-semibold text-ink transition-colors hover:border-blood/50 hover:text-blood"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="space-y-5 rounded-3xl border border-fog bg-white p-6 shadow-[0_20px_60px_-30px_rgba(10,10,10,0.25)] sm:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your name" htmlFor="ct-name" error={issues.name}>
          <input
            id="ct-name"
            type="text"
            autoComplete="name"
            value={values.name}
            onChange={(e) => setField("name", e.target.value)}
            className={textInputClass(Boolean(issues.name))}
            placeholder="Jane Doe"
          />
        </Field>
        <Field label="Email" htmlFor="ct-email" error={issues.email}>
          <input
            id="ct-email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(e) => setField("email", e.target.value)}
            className={textInputClass(Boolean(issues.email))}
            placeholder="you@example.com"
          />
        </Field>
      </div>

      <Field label="Subject" htmlFor="ct-subject" error={issues.subject}>
        <select
          id="ct-subject"
          value={values.subject}
          onChange={(e) => setField("subject", e.target.value as ContactSubject)}
          className={cn(textInputClass(Boolean(issues.subject)), "appearance-none pr-9")}
        >
          {CONTACT_SUBJECTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Message" htmlFor="ct-message" error={issues.message}>
        <textarea
          id="ct-message"
          rows={5}
          value={values.message}
          onChange={(e) => setField("message", e.target.value)}
          className={cn(textInputClass(Boolean(issues.message)), "h-auto min-h-[140px] resize-y py-3 leading-relaxed")}
          placeholder="How can we help?"
        />
      </Field>

      {formError && (
        <div className="rounded-xl border border-blood/25 bg-blood/5 px-4 py-3 text-sm leading-relaxed text-blood-deep">
          {formError}
        </div>
      )}

      <SubmitButton busy={busy}>
        <span className="inline-flex items-center gap-2">
          <Send size={16} />
          Send message
        </span>
      </SubmitButton>
    </form>
  );
}