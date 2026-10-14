"use client";

import { motion } from "framer-motion";
import { UserPlus } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;

interface OpenSpotCardProps {
  spotsLeft: number;
  index:     number;
  onAdd:     () => void;
}

/** One tile for every free roster spot, so a half-empty team doesn't look like a wall of placeholders. */
export function OpenSpotCard({ spotsLeft, index, onAdd }: OpenSpotCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onAdd}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.15 + index * 0.08, ease: EASE }}
      className="group flex min-h-[220px] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-[var(--rd-border)] p-6 text-center transition-colors hover:border-[var(--rd-accent-from)]/60 hover:bg-[var(--rd-accent-from)]/[0.03] focus-visible:border-[var(--rd-accent-from)] focus-visible:outline-none"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--rd-border)] bg-[var(--rd-panel)] text-[var(--rd-text-muted)] transition-all group-hover:scale-105 group-hover:border-[var(--rd-accent-from)] group-hover:text-[var(--rd-accent-from)]">
        <UserPlus size={18} />
      </span>
      <div>
        <p className="font-display text-base font-semibold text-[var(--rd-text)]">Add a player</p>
        <p className="mt-1 text-xs text-[var(--rd-text-muted)]">
          {spotsLeft} {spotsLeft === 1 ? "spot" : "spots"} left on your team
        </p>
      </div>
    </motion.button>
  );
}
