"use client";

import { useEffect } from "react";
import { Trophy, Flame, BookOpen, Zap } from "lucide-react";
import { BookOfMonthCard } from "@/features/reading/components/BookOfMonthCard";
import { QuizNightCard } from "@/features/reading/components/QuizNightCard";
import { StatTile } from "@/features/reading/components/StatTile";
import { MOCK_DASHBOARD } from "@/features/reading/mockData";
import { readingAuthApi } from "@/features/reading/authApi";
import { useReadingAuthStore } from "@/features/reading/store/useReadingAuthStore";

export default function ReadingHomePage() {
  const { user, updateUser } = useReadingAuthStore();

  useEffect(() => {
    readingAuthApi.me().then(updateUser).catch(() => { /* keep whatever we already have */ });
  }, [updateUser]);

  // Book of the month, quiz night, stats, semester map and bonus tasks have no
  // backend yet — only the greeting name comes from the real account so far.
  const dashboard = MOCK_DASHBOARD;
  const { stats } = dashboard;
  const firstName = user?.full_name?.split(" ")[0] || dashboard.greetingName;

  return (
    <div className="mx-auto w-full max-w-[1600px] px-8 py-10 lg:px-12">
      <div className="relative mb-8 flex flex-col gap-4 overflow-hidden rounded-[28px] border border-[var(--rd-accent-from)]/20 bg-[var(--rd-panel)] px-8 py-8 sm:flex-row sm:items-center sm:justify-between">
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
              {stats.readingStreakDays}-day streak
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
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
        <BookOfMonthCard book={dashboard.book} />
        <QuizNightCard quizNight={dashboard.quizNight} />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile size="lg" icon={Trophy} label="Team place" value={`${stats.teamPlace}/${stats.teamsTotal}`} note={stats.teamPlaceDelta} />
        <StatTile size="lg" icon={Zap} accent label="Your points" value={String(stats.yourPoints)} note={stats.pointsBreakdown} />
        <StatTile size="lg" icon={BookOpen} label="Books finished" value={`${stats.booksFinished}/${stats.booksTotal}`} note={stats.lastBookLabel} />
        <StatTile size="lg" icon={Flame} accent label="Reading streak" value={`${stats.readingStreakDays} days`} note={stats.streakNote} />
      </div>
    </div>
  );
}
