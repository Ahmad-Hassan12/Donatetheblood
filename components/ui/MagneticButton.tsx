"use client";

import { useRef } from "react";
import { useReducedMotion } from "framer-motion";
import type { MouseEvent as ReactMouseEvent, ReactNode } from "react";
import { cn } from "@/lib/cn";

interface MagneticButtonProps {
  children: ReactNode;
  href: string;
  className?: string;
}

export default function MagneticButton({
  children,
  href,
  className,
}: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const reduce = useReducedMotion();

  const onMove = (e: ReactMouseEvent<HTMLAnchorElement>) => {
    const el = ref.current;
    if (!el || reduce) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    el.style.transform = `translate(${x * 0.22}px, ${y * 0.3}px)`;
  };

  const onLeave = () => {
    const el = ref.current;
    if (el) el.style.transform = "";
  };

  return (
    <a
      ref={ref}
      href={href}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={cn(
        "inline-flex items-center justify-center gap-2 transition-transform duration-300 ease-out will-change-transform",
        className
      )}
    >
      {children}
    </a>
  );
}