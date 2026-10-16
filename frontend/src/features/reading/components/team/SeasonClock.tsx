"use client";

import { useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { Hourglass } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/shared/lib/utils";
import type { SemesterRound } from "@berea/api";
import { roundDayProgress } from "@/features/reading/lib/roundCalendar";
import { formatReadingDate } from "@/features/reading/lib/formatReadingDate";

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

function formatShortDate(iso: string, locale: string): string {
  return formatReadingDate(iso, locale, "dayMonthShort");
}

interface Duration {
  value: number;
  unit:  "day" | "hour";
}

function toDuration(ms: number): Duration {
  if (ms >= DAY_MS) return { value: Math.ceil(ms / DAY_MS), unit: "day" };
  return { value: Math.max(Math.ceil(ms / HOUR_MS), 1), unit: "hour" };
}

interface SeasonClockProps {
  rounds: SemesterRound[];
}

export function SeasonClock({ rounds }: SeasonClockProps) {
  const t = useTranslations("reading.team.clock");
  const now = useSyncExternalStore<number | null>(subscribeToMinutes, getMinuteSnapshot, getServerSnapshot);

  const timed = [...rounds].sort((a, b) => a.index - b.index).map((r) => ({
    round: r,
    start: new Date(r.starts_at).getTime(),
    end: new Date(r.ends_at).getTime(),
  }));
  const hasBegun = rounds.some((r) => r.status !== "locked");
  const active = timed.find((slot) => slot.round.status === "in_progress");
  // Before kickoff only Round 1 can be "next"; a later round never jumps the queue because Round 1's date passed.
  const candidates = hasBegun ? timed.filter((slot) => slot.round.status === "locked") : timed.slice(0, 1);
  const next = now === null ? undefined : candidates.find((slot) => slot.start > now);

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.3, ease: EASE }}
      className="relative overflow-hidden rounded-2xl border border-[var(--rd-border)] bg-[var(--rd-panel)] p-6"
    >
      <div className="flex items-center gap-2 text-[var(--rd-text-muted)]">
        <Hourglass size={14} />
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em]">{t("title")}</p>
      </div>

      {now === null ? (
        <div className="mt-5 h-20 animate-pulse rounded-xl bg-white/[0.03]" />
      ) : active ? (
        <ActiveRound end={active.end} now={now} round={active.round} />
      ) : next ? (
        <UpcomingRound round={next.round} msUntilStart={next.start - now} />
      ) : !hasBegun ? (
        <div className="mt-4">
          <p className="font-display text-xl font-semibold text-[var(--rd-text)]">{t("registrationTitle")}</p>
          <p className="mt-2 text-xs leading-relaxed text-[var(--rd-text-muted)]">{t("registrationBody")}</p>
        </div>
      ) : (
        <p className="mt-4 font-display text-xl font-semibold text-[var(--rd-text)]">
          {rounds.length > 0 ? t("complete") : t("scheduleSoon")}
        </p>
      )}

      {now !== null && timed.length > 0 && (
        <div className="mt-6 flex gap-1.5">
          {timed.map((slot, i) => {
            const isDone = slot.round.status === "done";
            const isActive = slot.round.status === "in_progress";
            const fill = isActive ? Math.min(Math.max((now - slot.start) / (slot.end - slot.start), 0), 1) : isDone ? 1 : 0;
            return (
              <div key={slot.round.id} className="flex flex-1 flex-col gap-1.5">
                <div className={cn("h-1.5 overflow-hidden rounded-full", isActive ? "bg-white/[0.08]" : "bg-[var(--rd-border)]")}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${fill * 100}%` }}
                    transition={{ duration: 0.9, delay: 0.5 + i * 0.12, ease: EASE }}
                    className={cn("h-full rounded-full", isDone ? "bg-emerald-400/70" : "rd-accent-gradient")}
                  />
                </div>
                <span className={cn("text-[10px]", isActive ? "font-semibold text-[var(--rd-text)]" : "text-[var(--rd-text-muted)]")}>
                  {t("roundShort", { index: slot.round.index })}
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
  const t = useTranslations("reading.team.clock");
  const until = toDuration(msUntilStart);

  return (
    <div className="mt-4">
      <p className="font-display text-xl font-semibold text-[var(--rd-text)]">{t("startsSoon", { round: round.label })}</p>
      <p className="mt-3 flex items-baseline gap-2">
        <span className="font-display text-5xl font-semibold text-[var(--rd-text)]">{until.value}</span>
        <span className="text-sm text-[var(--rd-text-muted)]">
          {until.unit === "day" ? t("daysToGo", { count: until.value }) : t("hoursToGo", { count: until.value })}
        </span>
      </p>
    </div>
  );
}

function ActiveRound({ round, end, now }: ActiveRoundProps) {
  const t = useTranslations("reading.team.clock");
  const locale = useLocale();
  const { dayNumber, totalDays, daysLeft } = roundDayProgress(round, now);
  const remaining: Duration = daysLeft > 0 ? { value: daysLeft, unit: "day" } : toDuration(end - now);

  return (
    <div className="mt-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-display text-xl font-semibold text-[var(--rd-text)]">{round.label}</p>
        <p className="text-xs text-[var(--rd-text-muted)]">
          {formatShortDate(round.starts_at, locale)} – {formatShortDate(round.ends_at, locale)}
        </p>
      </div>
      <p className="mt-3 flex items-baseline gap-2">
        <span className="bg-gradient-to-r from-[var(--rd-accent-from)] to-[var(--rd-accent-to)] bg-clip-text font-display text-5xl font-semibold text-transparent">
          {remaining.value}
        </span>
        <span className="text-sm text-[var(--rd-text-muted)]">
          {remaining.unit === "day" ? t("daysLeft", { count: remaining.value }) : t("hoursLeft", { count: remaining.value })}
        </span>
      </p>
      <p className="mt-1 text-xs text-[var(--rd-text-muted)]">
        {daysLeft > 0 ? t("dayOf", { day: dayNumber, total: totalDays }) : t("lastDayOf", { total: totalDays })}
      </p>
    </div>
  );
}
