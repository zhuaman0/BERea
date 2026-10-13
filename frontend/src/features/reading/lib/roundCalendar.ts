import type { SemesterRound } from "@berea/api";

const DAY_MS = 24 * 60 * 60 * 1000;

export interface RoundDayProgress {
  dayNumber: number;
  totalDays: number;
  /** Whole days still to come after today, so `dayNumber + daysLeft === totalDays`. */
  daysLeft:  number;
}

export function roundDayProgress(round: SemesterRound, now: number): RoundDayProgress {
  const start = new Date(round.starts_at).getTime();
  const end = new Date(round.ends_at).getTime();
  const totalDays = Math.max(Math.round((end - start) / DAY_MS), 1);
  const dayNumber = Math.min(Math.max(Math.floor((now - start) / DAY_MS) + 1, 1), totalDays);
  return { dayNumber, totalDays, daysLeft: totalDays - dayNumber };
}

/** "Fall semester 2026" — named after the month and year the first round starts in. */
export function seasonLabel(rounds: SemesterRound[]): string | null {
  const first = [...rounds].sort((a, b) => a.index - b.index)[0];
  if (!first) return null;
  const start = new Date(first.starts_at);
  const month = start.getMonth();
  const term = month <= 4 ? "Spring" : month <= 6 ? "Summer" : "Fall";
  return `${term} semester ${start.getFullYear()}`;
}
