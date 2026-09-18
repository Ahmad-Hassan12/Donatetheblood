import { TriangleAlert } from "lucide-react";

interface FieldErrorProps {
  error?: string;
  id?: string;
}

export default function FieldError({ error, id }: FieldErrorProps) {
  if (!error) return null;
  return (
    <p
      id={id}
      role="alert"
      className="mt-1.5 flex items-start gap-1.5 text-xs leading-relaxed text-blood"
    >
      <TriangleAlert size={13} className="mt-0.5 shrink-0" />
      {error}
    </p>
  );
}