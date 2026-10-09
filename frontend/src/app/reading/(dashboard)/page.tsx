"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Flame, BookOpen, Zap } from "lucide-react";
import { BookOfMonthCard } from "@/features/reading/components/BookOfMonthCard";
import { QuizNightCard } from "@/features/reading/components/QuizNightCard";
import { StatStrip, type StatStripItem } from "@/features/reading/components/StatStrip";
import { MOCK_DASHBOARD } from "@/features/reading/mockData";
import { readingAuthApi } from "@/features/reading/authApi";
import { useReadingAuthStore } from "@/features/reading/store/useReadingAuthStore";

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

  useEffect(() => {
    readingAuthApi.me().then(updateUser).catch(() => { /* keep whatever we already have */ });
  }, [updateUser]);

  // Book of the month, quiz night, points and books-finished have no backend
  // yet. The streak comes from the real account — updated server-side every
  // time this page loads.
  const dashboard = MOCK_DASHBOARD;
  const { stats } = dashboard;
  const firstName = user?.full_name?.split(" ")[0] || dashboard.greetingName;
  const currentStreak = user?.current_streak ?? 0;

  const statItems: StatStripItem[] = [
    { icon: Trophy,   label: "Team place",     value: `${stats.teamPlace}/${stats.teamsTotal}`,      note: stats.teamPlaceDelta,  accent: false },
    { icon: Zap,      label: "Your points",    value: String(stats.yourPoints),                      note: stats.pointsBreakdown, accent: true  },
    { icon: BookOpen, label: "Books finished", value: `${stats.booksFinished}/${stats.booksTotal}`,  note: stats.lastBookLabel,   accent: false },
    { icon: Flame,    label: "Reading streak", value: `${currentStreak} days`,                       note: stats.streakNote,      accent: true  },
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
          <button className="rd-accent-gradient rounded-lg px-5 py-2.5 text-sm font-semibold text-black/85">
            Continue reading
          </button>
          <button className="rounded-lg border border-[var(--rd-border)] px-5 py-2.5 text-sm text-[var(--rd-text)]">
            Log pages
          </button>
        </div>
      </motion.div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
        <motion.div {...fadeUp(0.08)} whileHover={HOVER_LIFT}>
          <BookOfMonthCard book={dashboard.book} />
        </motion.div>
        <motion.div {...fadeUp(0.14)} whileHover={HOVER_LIFT}>
          <QuizNightCard quizNight={dashboard.quizNight} />
        </motion.div>
      </div>

      <motion.div {...fadeUp(0.22)}>
        <StatStrip items={statItems} />
      </motion.div>
    </div>
  );
}
