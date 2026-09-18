import { cn } from "@/lib/cn";

interface DropGlyphProps {
  className?: string;
  size?: number;
}

export default function DropGlyph({ className, size = 24 }: DropGlyphProps) {
  return (
    <svg
      width={size}
      height={size * 1.25}
      viewBox="0 0 32 40"
      fill="none"
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      <path
        d="M16 2C24 12 28 17 28 24a12 12 0 1 1-24 0C4 17 8 12 16 2Z"
        fill="currentColor"
      />
    </svg>
  );
}