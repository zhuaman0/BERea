"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { BookOpen, Flame } from "lucide-react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { readingAuthApi } from "@berea/api";
import type { ReadingProfileStats, ReadingTeam } from "@berea/api";
import { cn } from "@/shared/lib/utils";
import { isApiError } from "@/features/auth/utils";
import { ReaderShelf } from "@/features/reading/components/ReaderShelf";
import { useReadingAuthStore } from "@/features/reading/store/useReadingAuthStore";
import { READING_PAGE_CONTAINER } from "@/features/reading/lib/pageContainer";
import { ReadingPageHero } from "@/features/reading/components/layout/ReadingPageHero";
import { formatReadingDate } from "@/features/reading/lib/formatReadingDate";
import { AvatarUploader } from "@/features/reading/components/AvatarUploader";

interface LedgerItemProps {
  value: string;
  label: string;
  hint?: string;
}

function LedgerItem({ value, label, hint }: LedgerItemProps) {
  return (
    <div className="lg:px-5 lg:first:pl-0">
      <p className="font-display text-[28px] font-semibold leading-none tabular-nums text-[var(--rd-text)]">{value}</p>
      <p className="mt-2 text-[13px] text-[var(--rd-text-muted)]">{label}</p>
      {hint && <p className="mt-0.5 text-[11px] text-[var(--rd-text-muted)]/70">{hint}</p>}
    </div>
  );
}

export default function ReadingProfilePage() {
  const t = useTranslations("reading.profile");
  const format = useFormatter();
  const locale = useLocale();
  const { user, updateUser } = useReadingAuthStore();
  const [team, setTeam] = useState<ReadingTeam | null>(null);
  const [stats, setStats] = useState<ReadingProfileStats | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    readingAuthApi.me().then(updateUser).catch(() => { /* keep whatever we already have */ });
    readingAuthApi.myTeam().then(setTeam).catch(() => { /* team line shows a dash until it loads */ });
    readingAuthApi
      .myStats()
      .then(setStats)
      .catch((err) => setLoadError(isApiError(err) ? err.detail : t("loadError")));
  }, [updateUser, t]);

  if (!user) {
    return <div className={READING_PAGE_CONTAINER}><p className="text-sm text-[var(--rd-text-muted)]">{t("loading")}</p></div>;
  }

  const streak = user.current_streak;
  const accuracy = stats && stats.answers_total > 0
    ? format.number(stats.answers_correct / stats.answers_total, { style: "percent", maximumFractionDigits: 0 })
    : "—";

  return (
    <div className={READING_PAGE_CONTAINER}>
      <ReadingPageHero
        eyebrow={t("eyebrow")}
        eyebrowIcon={BookOpen}
        leading={<AvatarUploader user={user} onChange={updateUser} />}
        title={user.full_name}
        description={t("description", { handle: user.email.split("@")[0], date: formatReadingDate(user.created_at, locale, "monthYear") })}
        aside={
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-3 rounded-xl border border-[var(--rd-border)] bg-black/20 px-4 py-3">
              <Flame
                size={22}
                className={cn(
                  streak > 0
                    ? "fill-[var(--rd-accent-from)]/35 text-[var(--rd-accent-from)] drop-shadow-[0_0_6px_rgba(255,107,44,0.6)]"
                    : "text-[var(--rd-text-muted)]/50"
                )}
              />
              <div>
                <p className="font-display text-[15px] font-semibold leading-tight text-[var(--rd-text)]">
                  {t("streak", { count: streak })}
                </p>
                <p className="text-[11px] text-[var(--rd-text-muted)]">
                  {streak > 0 ? t("streakActive") : t("streakEmpty")}
                </p>
              </div>
            </div>

            <Link
              href={"/reading/team" as Route}
              className="rounded-xl border border-[var(--rd-border)] bg-black/20 px-4 py-3 transition-colors hover:border-[var(--rd-accent-from)]/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rd-accent-from)]"
            >
              <p className="font-display text-[15px] font-semibold leading-tight text-[var(--rd-text)]">
                {user.team_name ?? t("noTeam")}
              </p>
              <p className="text-[11px] text-[var(--rd-text-muted)]">
                {team ? t("teamStanding", { place: team.place, total: team.teams_total, points: team.points }) : t("teamStandingLoading")}
              </p>
            </Link>
          </div>
        }
      />

      {loadError ? (
        <p className="mt-10 text-sm text-[var(--rd-text-muted)]">{t("loadErrorRetry", { error: loadError })}</p>
      ) : (
        <>
          <section
            aria-label={t("statsLabel")}
            className="mt-10 grid grid-cols-2 gap-x-6 gap-y-7 divide-[var(--rd-border)] border-y border-[var(--rd-border)] py-6 sm:grid-cols-3 lg:grid-cols-6 lg:gap-x-0 lg:divide-x"
          >
            <LedgerItem value={stats ? format.number(stats.quiz_points) : "—"} label={t("quizPoints")} hint={t("quizPointsHint")} />
            <LedgerItem
              value={accuracy}
              label={t("accuracy")}
              hint={stats ? t("accuracyHint", { correct: stats.answers_correct, total: stats.answers_total }) : undefined}
            />
            <LedgerItem value={stats ? format.number(stats.quiz_nights) : "—"} label={t("quizNights")} />
            <LedgerItem value={stats ? format.number(stats.pages_read) : "—"} label={t("pagesRead")} />
            <LedgerItem value={stats ? format.number(stats.books_finished) : "—"} label={t("booksFinished")} />
            <LedgerItem value={stats ? format.number(stats.votes_cast) : "—"} label={t("votesCast")} />
          </section>

          <section className="mt-10">
            <h2 className="font-display text-xl font-semibold text-[var(--rd-text)]">{t("shelfTitle")}</h2>
            <p className="mb-6 mt-1 text-[13px] text-[var(--rd-text-muted)]">
              {t("shelfHint")}
            </p>
            {stats ? (
              <ReaderShelf shelf={stats.shelf} />
            ) : (
              <p className="text-sm text-[var(--rd-text-muted)]">{t("shelfLoading")}</p>
            )}
          </section>
        </>
      )}
    </div>
  );
}
