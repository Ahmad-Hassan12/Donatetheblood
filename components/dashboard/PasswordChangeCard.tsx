"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, KeyRound, Loader2 } from "lucide-react";
import { changePassword } from "@/lib/app-api";
import { logout } from "@/lib/api";
import { Field } from "@/components/ui/FormInputs";

export default function PasswordChangeCard() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    kind: "success" | "error";
  } | null>(null);

  async function update() {
    setMessage(null);
    if (!currentPassword) {
      setMessage({
        text: "Enter your current password.",
        kind: "error",
      });
      return;
    }
    if (newPassword.length < 8) {
      setMessage({
        text: "New password must be at least 8 characters.",
        kind: "error",
      });
      return;
    }
    if (newPassword !== confirm) {
      setMessage({
        text: "The two passwords don't match.",
        kind: "error",
      });
      return;
    }
    setBusy(true);
    try {
      await changePassword(currentPassword, newPassword);
      await logout();
      router.push("/login");
    } catch (err) {
      setMessage({
        text:
          err instanceof Error
            ? err.message
            : "Couldn't update the password. Try again.",
        kind: "error",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-3xl border border-line bg-card p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-blood/10 text-blood">
          <KeyRound size={20} />
        </span>
        <div>
          <h2 className="font-display text-xl font-bold text-ink">
            Change password
          </h2>
          <p className="mt-0.5 text-sm text-mute">
            Set a new password for your account.
          </p>
        </div>
      </div>

      {message && message.kind === "success" && (
        <div className="mt-5 flex items-start gap-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
          <p>{message.text}</p>
        </div>
      )}

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Current password" htmlFor="pw-current">
            <input
              id="pw-current"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              disabled={busy}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="h-11 w-full rounded-xl border border-line bg-white px-3.5 text-sm text-ink outline-none transition-colors focus:border-blood disabled:opacity-60"
            />
          </Field>
        </div>
        <Field label="New password" htmlFor="pw-new" hint="At least 8 characters">
          <input
            id="pw-new"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            disabled={busy}
            onChange={(e) => setNewPassword(e.target.value)}
            className="h-11 w-full rounded-xl border border-line bg-white px-3.5 text-sm text-ink outline-none transition-colors focus:border-blood disabled:opacity-60"
          />
        </Field>
        <Field label="Confirm new password" htmlFor="pw-confirm">
          <input
            id="pw-confirm"
            type="password"
            autoComplete="new-password"
            value={confirm}
            disabled={busy}
            onChange={(e) => setConfirm(e.target.value)}
            className="h-11 w-full rounded-xl border border-line bg-white px-3.5 text-sm text-ink outline-none transition-colors focus:border-blood disabled:opacity-60"
          />
        </Field>
      </div>
      {message && message.kind === "error" && (
        <p className="mt-3 text-sm text-red-700">{message.text}</p>
      )}
      <button
        type="button"
        disabled={busy}
        onClick={() => void update()}
        className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-blood px-6 text-sm font-semibold text-white transition-colors hover:bg-blood-deep disabled:opacity-50"
      >
        {busy ? <Loader2 size={15} className="animate-spin" /> : <KeyRound size={15} />}
        {busy ? "Saving…" : "Update password"}
      </button>
    </section>
  );
}