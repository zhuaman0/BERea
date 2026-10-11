"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { BOOK_COVER, BOOK_SPINE_WIDTH } from "./TeamBook";
import { toRoman } from "./teamTheme";

const EASE = [0.16, 1, 0.3, 1] as const;

interface OpenSpotCardProps {
  rosterSlot: number;
  index:      number;
  onAdd:      () => void;
}

export function OpenSpotCard({ rosterSlot, index, onAdd }: OpenSpotCardProps) {
  const { x, y, width, height, radius } = BOOK_COVER;
  const outline = "fill-transparent stroke-[var(--rd-text-muted)] transition-colors group-hover:stroke-[var(--rd-accent-from)]";

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
      <span aria-hidden="true" className="absolute right-5 top-3 select-none font-serif text-[52px] font-bold italic leading-none text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.1)]">
        {toRoman(rosterSlot)}
      </span>

      <div className="relative w-24">
        <motion.svg
          viewBox="0 0 200 200"
          aria-hidden="true"
          className="w-full overflow-visible"
          animate={{ opacity: [0.45, 0.9, 0.45] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <rect x={x} y={y} width={width} height={height} rx={radius} strokeWidth="3" strokeDasharray="10 8" className={outline} />
          <line x1={x + BOOK_SPINE_WIDTH} y1={y} x2={x + BOOK_SPINE_WIDTH} y2={y + height} strokeWidth="3" strokeDasharray="10 8" className={outline} />
        </motion.svg>
        <span className="absolute inset-0 flex items-center justify-center pl-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--rd-border)] bg-[var(--rd-panel)] text-[var(--rd-text-muted)] transition-all group-hover:scale-110 group-hover:border-[var(--rd-accent-from)] group-hover:text-[var(--rd-accent-from)]">
            <Plus size={18} />
          </span>
        </span>
      </div>

      <div>
        <p className="font-display text-base font-semibold text-[var(--rd-text)]">Empty chapter</p>
        <p className="mt-1 text-xs text-[var(--rd-text-muted)]">Add a reader to write the next one</p>
      </div>
    </motion.button>
  );
}
