"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Phone, Send, X } from "lucide-react";
import type { DonorSearchResult } from "@/lib/search-types";
import { displayName } from "@/lib/search-utils";
import { authFetch } from "@/lib/auth-client";

// Reuses the phone pattern from the registration form (RegisterForm.tsx).
const PHONE_RE = /^\+?[\d\s()-]{8,18}$/;

interface DonorRequestModalProps {
  donor: DonorSearchResult;
  onClose: () => void;
  onSent: () => void;
}

type Phase = { status: "form" } | { status: "sending" } | { status: "done" } | { status: "error"; message: string };

export default function DonorRequestModal({ donor, onClose, onSent }: DonorRequestModalProps) {
  const [phase, setPhase] = useState<Phase>({ status: "form" });
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Backend error responses carry the human-readable text in `message` (and
  // sometimes `error`), e.g. "Phone number must be at least 10 digits" or
  // "This donor is currently not available".
  function readError(body: unknown, fallback: string): string {
    if (body && typeof body === "object") {
      const b = body as Record<string, unknown>;
      if (typeof b.message === "string" && b.message) return b.message;
      if (typeof b.error === "string" && b.error) return b.error;
    }
    return fallback;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!PHONE_RE.test(contact.trim())) {
      setPhase({
        status: "error",
        message: "Enter a valid phone number.",
      });
      return;
    }
    setPhase({ status: "sending" });
    const payload: Record<string, string> = { phone: contact.trim() };
    if (message.trim()) payload.note = message.trim();
    try {
      const res = await authFetch(
        `/api/blood-requests/${encodeURIComponent(donor.id)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setPhase({
          status: "error",
          message: readError(body, "Something went wrong, please try again."),
        });
        return;
      }
      setContact("");
      setMessage("");
      setPhase({ status: "done" });
      // Let the confirmation render, then close so the card flips to "Requested".
      window.setTimeout(onSent, 1800);
    } catch {
      setPhase({
        status: "error",
        message: "Something went wrong, please try again.",
      });
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Send blood request"
      className="fixed inset-0 z-[90] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-xl sm:rounded-3xl"
      >
        {phase.status === "done" ? (
          <DoneView onDone={onSent} donorName={displayName(donor.name)} bloodGroup={donor.bloodGroup} />
        ) : (
          <>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-lg font-bold text-ink">
                  Send a blood request
                </h2>
                <p className="mt-1 text-sm text-mute">
                  The request goes to{" "}
                  <span className="font-semibold text-ink">{displayName(donor.name)}</span> —{" "}
                  <span className="font-semibold text-ink">{donor.bloodGroup}</span>
                </p>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-mute transition-colors hover:bg-smoke hover:text-ink"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={submit} className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="req-contact"
                  className="block text-xs font-semibold uppercase tracking-wide text-ink"
                >
                  Your WhatsApp / phone number <span className="text-blood">*</span>
                </label>
                <p className="mt-1 text-xs leading-relaxed text-mute">
                  This number is shared with the donor so they can contact you
                  directly.
                </p>
                <div className="relative mt-2">
                  <Phone
                    size={16}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-mute"
                  />
                  <input
                    id="req-contact"
                    type="tel"
                    required
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="0300 1234567"
                    autoComplete="tel"
                    className="h-12 w-full rounded-full border border-ink/15 bg-white pl-10 pr-4 text-sm text-ink outline-none transition-colors duration-150 placeholder:text-mute focus:border-blood"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="req-message"
                  className="block text-xs font-semibold uppercase tracking-wide text-ink"
                >
                  Add more details (optional)
                </label>
                <textarea
                  id="req-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  placeholder="e.g. hospital, patient details, urgency..."
                  className="mt-2 w-full resize-none rounded-2xl border border-ink/15 bg-white p-4 text-sm text-ink outline-none transition-colors duration-150 placeholder:text-mute focus:border-blood"
                />
              </div>

              {phase.status === "error" && (
                <p className="rounded-xl bg-red-50 px-3 py-2 text-xs leading-relaxed text-red-800">
                  {phase.message}
                </p>
              )}

              <div className="grid grid-cols-2 gap-2">
                <a
                  href={
                    donor.phone
                      ? `tel:${donor.phone.replace(/[\s()-]/g, "")}`
                      : undefined
                  }
                  aria-disabled={donor.phone ? undefined : "true"}
                  className={
                    donor.phone
                      ? "inline-flex h-12 items-center justify-center gap-2 rounded-full border border-blood/40 bg-white px-4 text-sm font-semibold text-blood transition-colors hover:bg-blood/5"
                      : "inline-flex h-12 cursor-not-allowed items-center justify-center gap-2 rounded-full border border-fog bg-smoke px-4 text-sm font-semibold text-ink/40"
                  }
                >
                  <Phone size={16} />
                  Call Now
                </a>

                <button
                  type="submit"
                  disabled={phase.status === "sending" || !PHONE_RE.test(contact.trim())}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-blood text-sm font-semibold text-white shadow-[0_10px_24px_-10px_rgba(217,28,43,0.8)] transition-colors hover:bg-blood-deep disabled:opacity-60"
                >
                  {phase.status === "sending" ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={15} />
                  )}
                  {phase.status === "sending" ? "Sending…" : "Send request"}
                </button>
              </div>

              <p className="text-center text-xs text-mute">
                Sending the request alerts the donor and the team.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function DoneView({
  onDone,
  donorName,
  bloodGroup,
}: {
  onDone: () => void;
  donorName: string;
  bloodGroup: string;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-100">
        <CheckCircle2 size={26} className="text-emerald-600" />
      </div>
      <h2 className="mt-4 font-display text-xl font-bold text-ink">
        Request sent!
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-mute">
        <strong>{donorName}</strong> ({bloodGroup}) has been notified. You can
        head back to the list while they respond.
      </p>

      <button
        type="button"
        onClick={onDone}
        className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-full bg-blood text-sm font-semibold text-white shadow-[0_10px_24px_-10px_rgba(217,28,43,0.8)] transition-colors hover:bg-blood-deep"
      >
        Done
      </button>
    </div>
  );
}