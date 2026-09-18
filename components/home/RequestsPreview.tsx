"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, MapPin, Clock } from "lucide-react";
import Reveal from "@/components/ui/Reveal";

interface Request {
  blood: string;
  urgency: string;
  critical: boolean;
  title: string;
  location: string;
  distance: string;
  time: string;
}

const REQUESTS: Request[] = [
  {
    blood: "O−",
    urgency: "Critical",
    critical: true,
    title: "ICU transfusion",
    location: "City General Hospital",
    distance: "2.4 km away",
    time: "11 min ago",
  },
  {
    blood: "A−",
    urgency: "Urgent",
    critical: false,
    title: "Delivery complication",
    location: "St. Mary's Maternity",
    distance: "1.8 km away",
    time: "26 min ago",
  },
  {
    blood: "B+",
    urgency: "Urgent",
    critical: false,
    title: "Surgery tomorrow",
    location: "Lakeside Medical Centre",
    distance: "5.3 km away",
    time: "41 min ago",
  },
];

function RequestCard({ request }: { request: Request }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      whileHover={
        reduce
          ? undefined
          : { y: -6, borderColor: "rgba(217,28,43,0.5)" }
      }
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm transition-colors sm:p-7"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blood font-display text-base font-bold text-white">
            {request.blood}
          </span>
          <div>
            <p className="font-display text-[15px] font-bold tracking-tight text-white">
              {request.title}
            </p>
            <p className="text-xs text-white/50">{request.blood} needed</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blood px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white">
          {request.critical && (
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
            </span>
          )}
          {request.urgency}
        </span>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/10 pt-5 text-sm text-white/60">
        <span className="inline-flex items-center gap-1.5">
          <MapPin size={14} className="text-blood" />
          {request.location}
        </span>
        <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs font-medium text-white/80">
          {request.distance}
        </span>
        <span className="ml-auto inline-flex items-center gap-1.5 text-xs">
          <Clock size={13} />
          {request.time}
        </span>
      </div>
    </motion.div>
  );
}

export default function RequestsPreview() {
  return (
    <section id="requests" data-bg="dark" className="relative overflow-hidden bg-ink py-24 md:py-32">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(50%_60%_at_15%_0%,rgba(217,28,43,0.18),transparent_70%)]"
      />
      <div className="relative z-10 mx-auto max-w-6xl px-6 md:px-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Reveal className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blood">
              Urgent requests
            </p>
            <h2 className="mt-3 text-balance font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Someone near you needs blood right now.
            </h2>
          </Reveal>

          <Reveal delay={0.15}>
            <Link
              href="/find-a-donor"
              className="group inline-flex items-center gap-2 font-semibold text-white"
            >
              <span className="underline decoration-blood decoration-2 underline-offset-4">
                View all requests
              </span>
              <ArrowRight
                size={17}
                className="text-blood transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </Reveal>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
          {REQUESTS.map((request, i) => (
            <Reveal key={request.title} delay={i * 0.12} duration={0.6} amount={0.3}>
              <RequestCard request={request} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}