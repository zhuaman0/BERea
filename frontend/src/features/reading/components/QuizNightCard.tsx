"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { useQuery } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { readingLiveQuizApi, readingQuizApi } from "@berea/api";
import { useReadingAuthStore } from "@/features/reading/store/useReadingAuthStore";
import { formatVoteDateTime } from "@/features/reading/lib/formatReadingDate";

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

interface CountdownUnitProps {
  value: number;
  label: string;
}

function CountdownUnit({ value, label }: CountdownUnitProps) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-display text-4xl font-semibold text-[var(--rd-text)]">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-xs uppercase tracking-[0.15em] text-[var(--rd-text-muted)]">{label}</span>
    </div>
  );
}

export function QuizNightCard() {
  const t = useTranslations("reading.quizNight");
  const locale = useLocale();
  const userId = useReadingAuthStore((state) => state.user?.id);
  const [now, setNow] = useState(() => Date.now());
  const upcomingQuery = useQuery({
    queryKey: ["reading-upcoming-quiz", userId],
    queryFn: readingQuizApi.upcoming,
    enabled: Boolean(userId),
    refetchInterval: MINUTE_MS,
  });
  const liveQuery = useQuery({
    queryKey: ["reading-live-quiz", userId],
    queryFn: readingLiveQuizApi.live,
    enabled: Boolean(userId),
    refetchInterval: 15_000,
  });

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 15_000);
    return () => window.clearInterval(timer);
  }, []);

  const live = liveQuery.data && liveQuery.data.phase !== "finished" ? liveQuery.data : null;
  const upcoming = upcomingQuery.data ?? null;

  if (upcomingQuery.isPending || liveQuery.isPending) {
    return <div className="h-60 animate-pulse rounded-2xl border border-[var(--rd-border)] bg-[var(--rd-panel)]" />;
  }

  if (live) {
    return (
      <div className="flex h-full flex-col rounded-2xl border border-[var(--rd-border)] bg-[var(--rd-panel)] p-7">
        <p className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-[var(--rd-accent-from)]">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--rd-accent-from)]" />
          {t("liveTitle")}
        </p>
        <p className="font-display mt-4 text-2xl font-semibold text-[var(--rd-text)]">{live.quiz_title}</p>
        <p className="mt-2 text-sm text-[var(--rd-text-muted)]">{t("liveBody")}</p>
        <Link
          href={`/reading/quiz?pin=${live.pin}` as Route}
          className="rd-accent-gradient mt-auto block rounded-lg py-3 text-center text-sm font-semibold text-black/85 transition-opacity hover:opacity-90"
        >
          {t("join")}
        </Link>
      </div>
    );
  }

  if (!upcoming) {
    return (
      <div className="flex h-full flex-col rounded-2xl border border-[var(--rd-border)] bg-[var(--rd-panel)] p-7">
        <p className="text-xs uppercase tracking-[0.15em] text-[var(--rd-text-muted)]">{t("title")}</p>
        <p className="font-display mt-4 text-2xl font-semibold text-[var(--rd-text)]">
          {upcomingQuery.error ? t("loadError") : t("tbaTitle")}
        </p>
        <p className="mt-2 text-sm text-[var(--rd-text-muted)]">{upcomingQuery.error ? t("loadErrorBody") : t("tbaBody")}</p>
      </div>
    );
  }

  const timeLeft = Math.max(0, Date.parse(upcoming.scheduledFor) - now);

  return (
    <div className="flex h-full flex-col rounded-2xl border border-[var(--rd-border)] bg-[var(--rd-panel)] p-7">
      <p className="text-xs uppercase tracking-[0.15em] text-[var(--rd-text-muted)]">{t("title")}</p>
      <p className="font-display mt-2 text-lg font-semibold text-[var(--rd-text)]">{upcoming.title}</p>

      {timeLeft > 0 ? (
        <div className="mt-4 flex items-center justify-center gap-6">
          <CountdownUnit value={Math.floor(timeLeft / DAY_MS)} label={t("units.days")} />
          <CountdownUnit value={Math.floor((timeLeft % DAY_MS) / HOUR_MS)} label={t("units.hours")} />
          <CountdownUnit value={Math.floor((timeLeft % HOUR_MS) / MINUTE_MS)} label={t("units.minutes")} />
        </div>
      ) : (
        <p className="font-display mt-4 text-center text-2xl font-semibold text-[var(--rd-text)]">{t("startingSoon")}</p>
      )}

      <p className="mt-6 text-center text-base text-[var(--rd-text)]">{formatVoteDateTime(upcoming.scheduledFor, locale)}</p>
      <p className="mt-auto pt-4 text-center text-xs text-[var(--rd-text-muted)]">{t("pinNote")}</p>
    </div>
  );
}
