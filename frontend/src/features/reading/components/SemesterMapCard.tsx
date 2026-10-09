"use client";

import { motion } from "framer-motion";
import { cn } from "@/shared/lib/utils";
import type { SemesterMonth } from "@/features/reading/types";

interface SemesterMapCardProps {
  months: SemesterMonth[];
}

const EASE = [0.16, 1, 0.3, 1] as const;

const GLOW_PULSE = [
  "0 0 0px 0px rgba(255, 138, 61, 0)",
  "0 0 28px 3px rgba(255, 138, 61, 0.55)",
  "0 0 0px 0px rgba(255, 138, 61, 0)",
];

export function SemesterMapCard({ months }: SemesterMapCardProps) {
  return (
    <div className="rounded-2xl border border-[var(--rd-border)] bg-[var(--rd-panel)] p-7">
      <p className="mb-1 text-base font-medium text-[var(--rd-text)]">Semester map</p>
      <p className="mb-7 text-[12px] text-[var(--rd-text-muted)]">One book a month, shelved as you finish it.</p>

      <div className="flex items-end justify-between gap-3 sm:gap-4">
        {months.map((month, i) => {
          const isDone = month.status === "done";
          const isActive = month.status === "in_progress";
          const shortLabel = month.label.split(" · ")[0];

          return (
            <div key={month.index} className="flex flex-1 flex-col items-center">
              <motion.div
                initial={{ scaleY: 0, opacity: 0 }}
                whileInView={{ scaleY: 1, opacity: 1 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.55, delay: i * 0.08, ease: EASE }}
                style={{ transformOrigin: "bottom" }}
                className="w-full"
              >
                <motion.div
                  animate={isActive ? { boxShadow: GLOW_PULSE } : undefined}
                  transition={isActive ? { duration: 2.6, repeat: Infinity, ease: "easeInOut" } : undefined}
                  title={month.label}
                  className={cn(
                    "relative w-full rounded-t-[3px] transition-transform duration-300 ease-out hover:-translate-y-1",
                    isActive ? "h-24" : isDone ? "h-16" : "h-10 border border-dashed border-[var(--rd-border)]"
                  )}
                  style={{
                    background: isActive
                      ? "linear-gradient(180deg, var(--rd-accent-to), var(--rd-accent-from))"
                      : isDone
                      ? "linear-gradient(180deg, #4a3a30, #1d1613)"
                      : "transparent",
                    borderTop: isDone ? "2px solid #34d399" : undefined,
                  }}
                />
              </motion.div>

              <span
                className={cn(
                  "mt-2.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold",
                  isDone
                    ? "bg-emerald-400/15 text-emerald-400"
                    : isActive
                    ? "text-[var(--rd-accent-from)]"
                    : "text-[var(--rd-text-muted)]"
                )}
              >
                {month.index}
              </span>
              <p
                className={cn(
                  "mt-0.5 w-full truncate text-center text-[11px]",
                  isActive ? "font-medium text-[var(--rd-text)]" : "text-[var(--rd-text-muted)]"
                )}
              >
                {shortLabel}
              </p>
              <p className="mt-0.5 text-center text-[10px] text-[var(--rd-text-muted)]">
                {isActive ? "in progress" : month.points !== null ? `+${month.points}` : "—"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
