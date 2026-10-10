"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Flame } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { ReadingTeamMember } from "@/features/reading/authTypes";

const EASE = [0.16, 1, 0.3, 1] as const;

function firstName(fullName: string): string {
  return fullName.split(/\s+/)[0] ?? fullName;
}

function joinNames(names: string[]): string {
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

interface CheckInPanelProps {
  members: ReadingTeamMember[];
}

export function CheckInPanel({ members }: CheckInPanelProps) {
  const reduceMotion = useReducedMotion();
  const checkedIn = members.filter((m) => m.active_today);
  const waitingOn = members.filter((m) => !m.active_today).map((m) => firstName(m.full_name));
  const teamStreak = members.length > 0 ? Math.min(...members.map((m) => m.current_streak)) : 0;

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.2, ease: EASE }}
      className="rounded-2xl border border-[var(--rd-border)] bg-[var(--rd-panel)] p-6"
    >
      <div className="flex items-baseline justify-between">
        <p className="text-base font-medium text-[var(--rd-text)]">Today&apos;s check-in</p>
        <p className="text-sm text-[var(--rd-text-muted)]">
          <span className="font-semibold text-[var(--rd-text)]">{checkedIn.length}</span>/{members.length} in
        </p>
      </div>

      <div className="mt-6 flex items-end justify-around gap-2">
        {members.map((member, i) => {
          const isLit = member.active_today;
          return (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.3 + i * 0.1, ease: EASE }}
              className="flex min-w-0 flex-1 flex-col items-center gap-2"
            >
              <div className="relative flex h-16 w-16 items-center justify-center">
                {isLit && (
                  <span className="absolute inset-1 rounded-full bg-[var(--rd-accent-from)]/20 blur-xl" />
                )}
                <motion.span
                  animate={isLit && !reduceMotion ? { scale: [1, 1.1, 0.95, 1.05, 1], y: [0, -2, 0, -1, 0] } : undefined}
                  transition={isLit ? { duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 } : undefined}
                  className="relative flex"
                >
                  <Flame
                    size={40}
                    strokeWidth={1.75}
                    className={cn(
                      isLit
                        ? "fill-[var(--rd-accent-to)]/40 text-[var(--rd-accent-from)] drop-shadow-[0_0_14px_rgba(255,107,44,0.7)]"
                        : "text-[var(--rd-border)]"
                    )}
                  />
                </motion.span>
              </div>
              <p className="w-full truncate text-center text-xs font-medium text-[var(--rd-text)]">{firstName(member.full_name)}</p>
              <p className={cn("text-[11px]", isLit ? "text-[var(--rd-accent-to)]" : "text-[var(--rd-text-muted)]")}>
                {member.current_streak}d
              </p>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 border-t border-[var(--rd-border)] pt-5">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-3xl font-semibold text-[var(--rd-text)]">{teamStreak}</span>
          <span className="text-sm text-[var(--rd-text-muted)]">day team streak</span>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-[var(--rd-text-muted)]">
          The shortest streak on your roster — it only grows when everyone shows up.
        </p>
        <p className={cn("mt-3 text-xs font-medium", waitingOn.length === 0 ? "text-emerald-400" : "text-[var(--rd-text)]")}>
          {waitingOn.length === 0 ? "Whole team checked in today." : `Waiting on ${joinNames(waitingOn)} today.`}
        </p>
      </div>
    </motion.section>
  );
}
