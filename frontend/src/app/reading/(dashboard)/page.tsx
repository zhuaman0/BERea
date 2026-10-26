"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Trophy, Flame, BookOpen, Zap } from "lucide-react";
import { useTranslations } from "next-intl";
import { BookOfMonthCard } from "@/features/reading/components/BookOfMonthCard";
import { VoteStatusCard } from "@/features/reading/components/VoteStatusCard";
import { LogPagesModal } from "@/features/reading/components/LogPagesModal";
import { readingBookOfMonthApi } from "@berea/api";
import { QuizNightCard } from "@/features/reading/components/QuizNightCard";
import { StatStrip, type StatStripItem } from "@berea/ui-kit";
import { readingAuthApi } from "@berea/api";
import { readingSemesterApi } from "@berea/api";
import { useReadingAuthStore } from "@/features/reading/store/useReadingAuthStore";
import type { ReadingTeam } from "@berea/api";
import type { SemesterRound } from "@berea/api";
import { READING_PAGE_CONTAINER } from "@/features/reading/lib/pageContainer";

const EASE = [0.16, 1, 0.3, 1] as const;
const HOVER_LIFT = { y: -4, transition: { duration: 0.2, ease: EASE } };

type DayPeriod = "morning" | "afternoon" | "evening" | "other";

function currentDayPeriod(): DayPeriod {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "afternoon";
  return "evening";
}

const subscribeNever = () => () => {};

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.55, delay, ease: EASE },
  };
}

export default function ReadingHomePage() {
  const t = useTranslations("reading.home");
  // The server can't know the reader's clock, so it renders a neutral greeting and the client swaps it in.
  const dayPeriod = useSyncExternalStore<DayPeriod>(subscribeNever, currentDayPeriod, () => "other");
  const { user, updateUser } = useReadingAuthStore();
  const [team, setTeam] = useState<ReadingTeam | null>(null);
  const [rounds, setRounds] = useState<SemesterRound[]>([]);
  const queryClient = useQueryClient();
  const bookQueryKey = ["reading-book-of-month", user?.id] as const;
  const bookQuery = useQuery({
    queryKey: bookQueryKey,
    queryFn: readingBookOfMonthApi.get,
    enabled: Boolean(user?.id),
    staleTime: 0,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
  });
  const bookOfMonth = bookQuery.data ?? null;
  const [isLogOpen, setIsLogOpen] = useState(false);

  useEffect(() => {
    readingAuthApi.me().then(updateUser).catch(() => { /* keep whatever we already have */ });
    readingAuthApi.myTeam().then(setTeam).catch(() => { /* stat tile shows a dash until it loads */ });
    readingSemesterApi.listRounds().then(setRounds).catch(() => { /* same */ });
  }, [updateUser]);

  const firstName = user?.full_name?.split(" ")[0] || t("fallbackName");
  const currentStreak = user?.current_streak ?? 0;
  const booksFinished = rounds.filter((r) => r.status === "done").length;
  const activeRound = rounds.find((r) => r.status === "in_progress");

  const statItems: StatStripItem[] = [
    {
      icon: Trophy, label: t("stats.place"),
      value: team ? `${team.place}/${team.teams_total}` : "—",
      note: t("stats.placeNote"),
      accent: false,
    },
    {
      icon: Zap, label: t("stats.points"),
      value: team ? String(team.points) : "—",
      note: t("stats.pointsNote"),
      accent: true,
    },
    {
      icon: BookOpen, label: t("stats.books"),
      value: rounds.length > 0 ? `${booksFinished}/${rounds.length}` : "—",
      note: activeRound ? t("stats.roundInProgress", { round: activeRound.label }) : t("stats.noActiveRound"),
      accent: false,
    },
    {
      icon: Flame, label: t("stats.streak"),
      value: t("stats.streakDays", { count: currentStreak }),
      note: t("stats.streakNote"),
      accent: true,
    },
  ];

  return (
    <div className={READING_PAGE_CONTAINER}>
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
              {t("greeting", { name: firstName, period: dayPeriod })}
            </h1>
            <span className="rounded-full border border-[var(--rd-accent-from)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--rd-accent-from)]">
              {t("rank")}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--rd-ink)] px-3 py-1 text-xs font-semibold text-[var(--rd-text)]">
              <Flame size={13} className="text-[var(--rd-accent-from)]" />
              {t("streakBadge", { count: currentStreak })}
            </span>
          </div>
          <p className="mt-2 text-base text-[var(--rd-text-muted)]">{t("greetingNote")}</p>
        </div>
        <div className="relative flex shrink-0 gap-3">
          <button
            type="button"
            onClick={() => setIsLogOpen(true)}
            disabled={!bookOfMonth}
            title={bookOfMonth ? undefined : t("logPagesDisabled")}
            className="rd-accent-gradient rounded-lg px-5 py-2.5 text-sm font-semibold text-black/85 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t("logPages")}
          </button>
        </div>
      </motion.div>

      <VoteStatusCard />

      {bookQuery.error && <p role="alert" className="mb-4 text-sm text-red-400">{t("bookError")} <button type="button" className="underline" onClick={() => void bookQuery.refetch()}>{t("retry")}</button></p>}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
        <motion.div {...fadeUp(0.08)} whileHover={HOVER_LIFT}>
          <BookOfMonthCard result={bookOfMonth} isLoading={bookQuery.isPending} onLogPages={() => setIsLogOpen(true)} />
        </motion.div>
        <motion.div {...fadeUp(0.14)} whileHover={HOVER_LIFT}>
          <QuizNightCard />
        </motion.div>
      </div>

      <motion.div {...fadeUp(0.22)}>
        <StatStrip items={statItems} />
      </motion.div>
      {isLogOpen && bookOfMonth && (
        <LogPagesModal current={bookOfMonth} onClose={() => setIsLogOpen(false)} onSaved={(result) => queryClient.setQueryData(bookQueryKey, result)} />
      )}
    </div>
  );
}
