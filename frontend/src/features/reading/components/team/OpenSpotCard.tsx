"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { JERSEY_PATH } from "./TeamJersey";

const EASE = [0.16, 1, 0.3, 1] as const;

interface OpenSpotCardProps {
  rosterSlot: number;
  index:      number;
  onAdd:      () => void;
}

export function OpenSpotCard({ rosterSlot, index, onAdd }: OpenSpotCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onAdd}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.15 + index * 0.08, ease: EASE }}
      whileHover={{ y: -4 }}
      className="group relative flex min-h-[300px] flex-col items-center justify-center gap-4 overflow-hidden rounded-2xl border border-dashed border-[var(--rd-border)] bg-[var(--rd-ink)]/40 p-6 text-center transition-colors hover:border-[var(--rd-accent-from)]/60 focus-visible:border-[var(--rd-accent-from)] focus-visible:outline-none"
    >
      <span aria-hidden="true" className="absolute right-4 top-3 select-none font-display text-[56px] font-bold leading-none text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.08)]">
        {String(rosterSlot).padStart(2, "0")}
      </span>

      <div className="relative w-24">
        <motion.svg
          viewBox="0 0 200 200"
          aria-hidden="true"
          className="w-full overflow-visible"
          animate={{ opacity: [0.45, 0.9, 0.45] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <path
            d={JERSEY_PATH}
            strokeWidth="3"
            strokeDasharray="10 8"
            className="fill-transparent stroke-[var(--rd-text-muted)] transition-colors group-hover:stroke-[var(--rd-accent-from)]"
          />
        </motion.svg>
        <span className="absolute inset-0 flex items-center justify-center pt-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--rd-border)] bg-[var(--rd-panel)] text-[var(--rd-text-muted)] transition-all group-hover:scale-110 group-hover:border-[var(--rd-accent-from)] group-hover:text-[var(--rd-accent-from)]">
            <Plus size={18} />
          </span>
        </span>
      </div>

      <div>
        <p className="font-display text-base font-semibold text-[var(--rd-text)]">Spot open</p>
        <p className="mt-1 text-xs text-[var(--rd-text-muted)]">Add a student to fill this jersey</p>
      </div>
    </motion.button>
  );
}
