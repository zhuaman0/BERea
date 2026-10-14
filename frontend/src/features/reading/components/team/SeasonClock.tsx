"use client";

import { useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { Hourglass } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { SemesterRound } from "@berea/api";
import { roundDayProgress } from "@/features/reading/lib/roundCalendar";

const EASE = [0.16, 1, 0.3, 1] as const;
const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

function subscribeToMinutes(onTick: () => void): () => void {
  const id = window.setInterval(onTick, MINUTE_MS / 2);
  return () => window.clearInterval(id);
}

// Rounded to the minute so consecutive snapshots are equal and React doesn't re-render needlessly.
function getMinuteSnapshot(): number {
  return Math.floor(Date.now() / MINUTE_MS) * MINUTE_MS;
}

function getServerSnapshot(): null {
  return null;
}

function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDuration(ms: number): { value: number; unit: string } {
  if (ms >= DAY_MS) {
    const days = Math.ceil(ms / DAY_MS);
    return { value: days, unit: days === 1 ? "day" : "days" };
  }
  const hours = Math.max(Math.ceil(ms / HOUR_MS), 1);
  return { value: hours, unit: hours === 1 ? "hour" : "hours" };
}

interface SeasonClockProps {
  rounds: SemesterRound[];
}

export function SeasonClock({ rounds }: SeasonClockProps) {
  const now = useSyncExternalStore<number | null>(subscribeToMinutes, getMinuteSnapshot, getServerSnapshot);

  const timed = rounds.map((r) => ({
    round: r,
    start: new Date(r.starts_at).getTime(),
    end: new Date(r.ends_at).getTime(),
  }));
  const active = now === null ? undefined : timed.find((t) => now >= t.start && now <= t.end);
  const next = now === null ? undefined : timed.find((t) => t.start > now);

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.3, ease: EASE }}
      className="relative overflow-hidden rounded-2xl border border-[var(--rd-border)] bg-[var(--rd-panel)] p-6"
    >
      <div className="flex items-center gap-2 text-[var(--rd-text-muted)]">
        <Hourglass size={14} />
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em]">Season clock</p>
      </div>

      {now === null ? (
        <div className="mt-5 h-20 animate-pulse rounded-xl bg-white/[0.03]" />
      ) : active ? (
        <ActiveRound end={active.end} now={now} round={active.round} />
      ) : next ? (
        <UpcomingRound round={next.round} msUntilStart={next.start - now} />
      ) : (
        <p className="mt-4 font-display text-xl font-semibold text-[var(--rd-text)]">
          {rounds.length > 0 ? "Season complete" : "Schedule coming soon"}
        </p>
      )}

      {now !== null && timed.length > 0 && (
        <div className="mt-6 flex gap-1.5">
          {timed.map((t, i) => {
            const isDone = now > t.end;
            const isActive = now >= t.start && now <= t.end;
            const fill = isActive ? (now - t.start) / (t.end - t.start) : isDone ? 1 : 0;
            return (
              <div key={t.round.id} className="flex flex-1 flex-col gap-1.5">
                <div className={cn("h-1.5 overflow-hidden rounded-full", isActive ? "bg-white/[0.08]" : "bg-[var(--rd-border)]")}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${fill * 100}%` }}
                    transition={{ duration: 0.9, delay: 0.5 + i * 0.12, ease: EASE }}
                    className={cn("h-full rounded-full", isDone ? "bg-emerald-400/70" : "rd-accent-gradient")}
                  />
                </div>
                <span className={cn("text-[10px]", isActive ? "font-semibold text-[var(--rd-text)]" : "text-[var(--rd-text-muted)]")}>
                  R{t.round.index}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </motion.section>
  );
}

interface ActiveRoundProps {
  round: SemesterRound;
  end:   number;
  now:   number;
}

interface UpcomingRoundProps {
  round:        SemesterRound;
  msUntilStart: number;
}

function UpcomingRound({ round, msUntilStart }: UpcomingRoundProps) {
  const until = formatDuration(msUntilStart);

  return (
    <div className="mt-4">
      <p className="font-display text-xl font-semibold text-[var(--rd-text)]">{round.label} starts soon</p>
      <p className="mt-3 flex items-baseline gap-2">
        <span className="font-display text-5xl font-semibold text-[var(--rd-text)]">{until.value}</span>
        <span className="text-sm text-[var(--rd-text-muted)]">{until.unit} to go</span>
      </p>
    </div>
  );
}

function ActiveRound({ round, end, now }: ActiveRoundProps) {
  const { dayNumber, totalDays, daysLeft } = roundDayProgress(round, now);
  const remaining = daysLeft > 0
    ? { value: daysLeft, unit: daysLeft === 1 ? "day left" : "days left" }
    : { value: formatDuration(end - now).value, unit: `${formatDuration(end - now).unit} left` };

  return (
    <div className="mt-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-display text-xl font-semibold text-[var(--rd-text)]">{round.label}</p>
        <p className="text-xs text-[var(--rd-text-muted)]">
          {formatShortDate(round.starts_at)} – {formatShortDate(round.ends_at)}
        </p>
      </div>
      <p className="mt-3 flex items-baseline gap-2">
        <span className="bg-gradient-to-r from-[var(--rd-accent-from)] to-[var(--rd-accent-to)] bg-clip-text font-display text-5xl font-semibold text-transparent">
          {remaining.value}
        </span>
        <span className="text-sm text-[var(--rd-text-muted)]">{remaining.unit}</span>
      </p>
      <p className="mt-1 text-xs text-[var(--rd-text-muted)]">
        {daysLeft > 0 ? `Day ${dayNumber} of ${totalDays}` : `Last day of ${totalDays}`}
      </p>
    </div>
  );
}
