"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type Direction = "up" | "down" | "left" | "right" | "none";

const EASE = [0.22, 1, 0.36, 1] as const;

interface RevealProps {
  children: ReactNode;
  className?: string;
  direction?: Direction;
  delay?: number;
  duration?: number;
  amount?: number;
}

export default function Reveal({
  children,
  className,
  direction = "up",
  delay = 0,
  duration = 0.8,
  amount = 0.25,
}: RevealProps) {
  const reduce = useReducedMotion();

  const offsets: Record<Direction, { x?: number; y?: number }> = {
    up: { y: 36 },
    down: { y: -36 },
    left: { x: 40 },
    right: { x: -40 },
    none: {},
  };

  const hidden = reduce
    ? { opacity: 1 }
    : { opacity: 0, ...offsets[direction] };

  return (
    <motion.div
      className={className}
      initial={hidden}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}