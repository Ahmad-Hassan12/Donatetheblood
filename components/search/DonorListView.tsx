"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { DonorSearchResult } from "@/lib/search-types";
import DonorResultCard from "@/components/search/DonorResultCard";

interface DonorListViewProps {
  donors: DonorSearchResult[];
}

export default function DonorListView({ donors }: DonorListViewProps) {
  const reduce = useReducedMotion();

  return (
    <section aria-label="Donor results">
      <div className="mb-3 flex items-baseline justify-between">
        <p className="text-sm font-medium text-ink">
          {donors.length} donor{donors.length === 1 ? "" : "s"} nearby
        </p>
        <p className="text-xs text-mute">Nearest first</p>
      </div>

      <motion.ul
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: reduce ? 0 : 0.05 } } }}
        className="space-y-3"
      >
        {donors.map((donor) => (
          <motion.li
            key={donor.id}
            variants={{
              hidden: { opacity: 0, y: 8 },
              show: {
                opacity: 1,
                y: 0,
                transition: { duration: reduce ? 0 : 0.3, ease: "easeOut" },
              },
            }}
          >
            <DonorResultCard donor={donor} />
          </motion.li>
        ))}
      </motion.ul>
    </section>
  );
}