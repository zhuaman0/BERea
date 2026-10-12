"use client";

import type { LucideIcon } from "lucide-react";
import { AnimatedNumber } from "./AnimatedNumber";
import { cn } from "./cn";

const SM_COLS: Record<number, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
  5: "sm:grid-cols-5",
};

export interface StatStripItem {
  icon:   LucideIcon;
  label:  string;
  value:  string;
  note:   string;
  accent?: boolean;
}

interface AnimatedStatValueProps {
  value: string;
  className?: string;
}

/** Counts the leading number in a value like "136" or "9 days" up from 0; anything after the
 * number (a suffix, a "/14") is appended immediately since animating it adds nothing. */
function AnimatedStatValue({ value, className }: AnimatedStatValueProps) {
  const match = value.match(/^(\d+)(.*)$/);
  if (!match) return <span className={className}>{value}</span>;
  return (
    <span className={className}>
      <AnimatedNumber value={parseInt(match[1], 10)} />
      {match[2]}
    </span>
  );
}

interface StatStripProps {
  items: StatStripItem[];
}

/** A row of stats rendered as one divided strip (not separate cards) with animated count-up
 * values — the shared "how do we show a handful of numbers" pattern across reading-app pages. */
export function StatStrip({ items }: StatStripProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 divide-x divide-y divide-[var(--rd-border)] overflow-hidden rounded-2xl border border-[var(--rd-border)] bg-[var(--rd-panel)] sm:divide-y-0",
        SM_COLS[items.length] ?? "sm:grid-cols-4"
      )}
    >
      {items.map(({ icon: Icon, label, value, note, accent }) => (
        <div key={label} className="group flex flex-col gap-2 p-6 transition-colors duration-300 hover:bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <Icon size={14} className={accent ? "text-[var(--rd-accent-from)]" : "text-[var(--rd-text-muted)]"} />
            <span className="text-[11px] text-[var(--rd-text-muted)]">{label}</span>
          </div>
          <AnimatedStatValue
            value={value}
            className={cn(
              "font-display text-3xl font-semibold",
              accent
                ? "bg-gradient-to-r from-[var(--rd-accent-from)] to-[var(--rd-accent-to)] bg-clip-text text-transparent"
                : "text-[var(--rd-text)]"
            )}
          />
          <span className="text-[11px] text-[var(--rd-text-muted)]">{note}</span>
        </div>
      ))}
    </div>
  );
}
