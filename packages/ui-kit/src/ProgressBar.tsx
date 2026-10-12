"use client";

import { motion } from "framer-motion";
import { cn } from "./cn";

const TONES = {
  accent:  "rd-accent-gradient",
  muted:   "bg-[var(--rd-text-muted)]",
  success: "bg-emerald-400",
} as const;

const SIZES = {
  sm: "h-1.5",
  md: "h-2.5",
} as const;

interface ProgressBarProps {
  percent:    number;
  tone?:      keyof typeof TONES;
  size?:      keyof typeof SIZES;
  /** Delay before the fill animates in, e.g. to stagger a list of bars. */
  delay?:     number;
  className?: string;
}

/** A rounded track whose fill springs to `percent` (clamped to 0–100) whenever it changes. */
export function ProgressBar({ percent, tone = "accent", size = "md", delay = 0, className }: ProgressBarProps) {
  const clamped = Math.min(Math.max(percent, 0), 100);

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("w-full overflow-hidden rounded-full bg-[var(--rd-border)]", SIZES[size], className)}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={{ type: "spring", stiffness: 90, damping: 20, delay }}
        className={cn("h-full rounded-full", TONES[tone])}
      />
    </div>
  );
}
