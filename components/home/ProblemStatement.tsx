"use client";

import { motion, useReducedMotion } from "framer-motion";
import { MessageCircleMore, MapPinOff, ShieldQuestionMark } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

const PAIN_POINTS = [
  {
    icon: MessageCircleMore,
    line: "Scattered across WhatsApp groups and Facebook posts",
  },
  {
    icon: MapPinOff,
    line: "Matched donors, but too far to reach in time",
  },
  {
    icon: ShieldQuestionMark,
    line: "No way to know who's real and who's not",
  },
];

export default function ProblemStatement() {
  const reduce = useReducedMotion();

  return (
    <section data-bg="dark" className="relative overflow-hidden bg-ink py-16 md:py-24">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(45%_55%_at_50%_0%,rgba(217,28,43,0.12),transparent_75%)]"
      />

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center md:px-10">
        <motion.h2
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="text-balance font-display text-2xl font-bold tracking-tight text-white sm:text-3xl"
        >
          Finding a donor shouldn&apos;t feel like this.
        </motion.h2>

        <motion.div
          initial={reduce ? false : { scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
          className="mx-auto mt-5 h-[3px] w-14 origin-center rounded-full bg-blood"
          aria-hidden="true"
        />

        <motion.div
          initial={reduce ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          transition={{ staggerChildren: 0.14, delayChildren: 0.15 }}
          className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-6"
        >
          {PAIN_POINTS.map((point) => (
            <motion.div
              key={point.line}
              variants={{
                hidden: { opacity: 0, y: 26 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.7, ease: EASE },
                },
              }}
              className="flex flex-col items-center gap-4"
            >
              <motion.span
                initial={reduce ? false : { scale: 0.4, rotate: -10 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 15,
                  delay: 0.12,
                }}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-blood text-white shadow-[0_10px_28px_-10px_rgba(217,28,43,0.8)]"
              >
                <point.icon size={22} strokeWidth={1.8} />
              </motion.span>
              <p className="max-w-[26ch] text-[15px] leading-relaxed text-white/60">
                {point.line}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}