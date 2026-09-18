import { cn } from "@/lib/cn";
import FieldError from "@/components/ui/FieldError";

export function textInputClass(hasError?: boolean): string {
  return cn(
    "h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-ink transition-[border-color,box-shadow] placeholder:text-mute/70 focus:outline-none focus:ring-2",
    hasError
      ? "border-blood/60 focus:border-blood focus:ring-blood/15"
      : "border-ink/15 focus:border-blood focus:ring-blood/15"
  );
}

export function labelClass(htmlFor?: string): string {
  return cn(
    "mb-1.5 block text-sm font-semibold text-ink",
    htmlFor && "cursor-pointer"
  );
}

interface FieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  children: React.ReactNode;
}

export function Field({ label, htmlFor, error, hint, optional, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={htmlFor} className={labelClass(htmlFor)}>
        {label}
        {optional && <span className="ml-1 font-normal text-mute">(optional)</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="mt-1.5 text-xs leading-relaxed text-mute">{hint}</p>
      )}
      <FieldError error={error} id={htmlFor ? `${htmlFor}-error` : undefined} />
    </div>
  );
}

export function SubmitButton({
  busy,
  children,
  disabled,
}: {
  busy: boolean;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={busy || disabled}
      className="inline-flex h-12 w-full items-center justify-center rounded-full bg-blood px-6 text-[15px] font-semibold text-white shadow-[0_14px_32px_-12px_rgba(217,28,43,0.8)] transition-all duration-150 hover:bg-blood-deep disabled:cursor-not-allowed disabled:opacity-60"
    >
      {busy ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      ) : (
        children
      )}
    </button>
  );
}