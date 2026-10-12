"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Flame, BookOpen, Zap } from "lucide-react";
import { BookOfMonthCard } from "@/features/reading/components/BookOfMonthCard";
import { LogPagesModal } from "@/features/reading/components/LogPagesModal";
import { readingBookOfMonthApi, type BookOfMonthResult } from "@berea/api";
import { QuizNightCard } from "@/features/reading/components/QuizNightCard";
import { StatStrip, type StatStripItem } from "@berea/ui-kit";
import { MOCK_DASHBOARD } from "@/features/reading/mockData";
import { readingAuthApi } from "@berea/api";
import { readingSemesterApi } from "@berea/api";
import { useReadingAuthStore } from "@/features/reading/store/useReadingAuthStore";
import type { ReadingTeam } from "@berea/api";
import type { SemesterRound } from "@berea/api";

const EASE = [0.16, 1, 0.3, 1] as const;
const HOVER_LIFT = { y: -4, transition: { duration: 0.2, ease: EASE } };

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.55, delay, ease: EASE },
  };
}

export default function ReadingHomePage() {
  const { user, updateUser } = useReadingAuthStore();
  const [team, setTeam] = useState<ReadingTeam | null>(null);
  const [rounds, setRounds] = useState<SemesterRound[]>([]);
  const [bookOfMonth, setBookOfMonth] = useState<BookOfMonthResult | null>(null);
  const [isBookLoading, setIsBookLoading] = useState(true);
  const [isLogOpen, setIsLogOpen] = useState(false);

  useEffect(() => {
    readingAuthApi.me().then(updateUser).catch(() => { /* keep whatever we already have */ });
    readingAuthApi.myTeam().then(setTeam).catch(() => { /* stat tile shows a dash until it loads */ });
    readingSemesterApi.listRounds().then(setRounds).catch(() => { /* same */ });
    readingBookOfMonthApi
      .get()
      .then(setBookOfMonth)
      .catch(() => { /* card shows its "not chosen yet" state */ })
      .finally(() => setIsBookLoading(false));
  }, [updateUser]);

  // Book of the month and quiz night have no backend yet. Everything in the
  // stat strip below is either real (streak, team place, books finished) or
  // an honest zero — never a made-up number.
  const dashboard = MOCK_DASHBOARD;
  const firstName = user?.full_name?.split(" ")[0] || dashboard.greetingName;
  const currentStreak = user?.current_streak ?? 0;
  const booksFinished = rounds.filter((r) => r.status === "done").length;
  const activeRound = rounds.find((r) => r.status === "in_progress");

  const statItems: StatStripItem[] = [
    {
      icon: Trophy, label: "Team place",
      value: team ? `${team.place}/${team.teams_total}` : "—",
      note: "Ranked by roster size for now",
      accent: false,
    },
    {
      icon: Zap, label: "Your points",
      value: "0",
      note: "Points start counting at the first quiz night",
      accent: true,
    },
    {
      icon: BookOpen, label: "Books finished",
      value: rounds.length > 0 ? `${booksFinished}/${rounds.length}` : "—",
      note: activeRound ? `${activeRound.label} in progress` : "No active round",
      accent: false,
    },
    {
      icon: Flame, label: "Reading streak",
      value: `${currentStreak} ${currentStreak === 1 ? "day" : "days"}`,
      note: "+5 pts per 7-day streak",
      accent: true,
    },
  ];

  return (
    <div className="w-full px-8 py-10 lg:px-12">
      <motion.div
        {...fadeUp(0)}
        className="relative mb-8 flex flex-col gap-4 overflow-hidden rounded-[28px] border border-[var(--rd-accent-from)]/20 bg-[var(--rd-panel)] px-8 py-8 sm:flex-row sm:items-center sm:justify-between"
      >
        <Flame
          size={160}
          className="pointer-events-none absolute -left-10 -top-10 text-[var(--rd-accent-from)]/[0.07]"
          aria-hidden="true"
        />
        <Flame
          size={160}
          className="pointer-events-none absolute -bottom-10 -right-10 text-[var(--rd-accent-from)]/[0.07]"
          aria-hidden="true"
        />

        <div className="relative">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-4xl font-semibold text-[var(--rd-text)]">
              Good evening, {firstName}
            </h1>
            <span className="rounded-full border border-[var(--rd-accent-from)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--rd-accent-from)]">
              Challenger
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--rd-ink)] px-3 py-1 text-xs font-semibold text-[var(--rd-text)]">
              <Flame size={13} className="text-[var(--rd-accent-from)]" />
              {currentStreak}-day streak
            </span>
          </div>
          <p className="mt-2 text-base text-[var(--rd-text-muted)]">{dashboard.greetingNote}</p>
        </div>
        <div className="relative flex shrink-0 gap-3">
          <button
            type="button"
            onClick={() => setIsLogOpen(true)}
            disabled={!bookOfMonth}
            title={bookOfMonth ? undefined : "Available once the book of the month is chosen"}
            className="rd-accent-gradient rounded-lg px-5 py-2.5 text-sm font-semibold text-black/85 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Log pages
          </button>
        </div>
      </motion.div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
        <motion.div {...fadeUp(0.08)} whileHover={HOVER_LIFT}>
          <BookOfMonthCard result={bookOfMonth} isLoading={isBookLoading} onLogPages={() => setIsLogOpen(true)} />
        </motion.div>
        <motion.div {...fadeUp(0.14)} whileHover={HOVER_LIFT}>
          <QuizNightCard quizNight={dashboard.quizNight} />
        </motion.div>
      </div>

      <motion.div {...fadeUp(0.22)}>
        <StatStrip items={statItems} />
      </motion.div>
      {isLogOpen && bookOfMonth && (
        <LogPagesModal current={bookOfMonth} onClose={() => setIsLogOpen(false)} onSaved={setBookOfMonth} />
      )}
    </div>
  );
}
