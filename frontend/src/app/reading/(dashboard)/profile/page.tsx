"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Flame } from "lucide-react";
import { readingAuthApi } from "@berea/api";
import { initials } from "@berea/core";
import type { ReadingProfileStats, ReadingTeam } from "@berea/api";
import { cn } from "@/shared/lib/utils";
import { isApiError } from "@/features/auth/utils";
import { ReaderShelf } from "@/features/reading/components/ReaderShelf";
import { useReadingAuthStore } from "@/features/reading/store/useReadingAuthStore";
import { READING_PAGE_CONTAINER } from "@/features/reading/lib/pageContainer";

function memberSinceLabel(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

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
      .catch((err) => setLoadError(isApiError(err) ? err.detail : "Couldn't load your reading stats."));
  }, [updateUser]);

  if (!user) {
    return <div className={READING_PAGE_CONTAINER}><p className="text-sm text-[var(--rd-text-muted)]">Loading profile…</p></div>;
  }

  const streak = user.current_streak;
  const accuracy = stats && stats.answers_total > 0
    ? `${Math.round((stats.answers_correct / stats.answers_total) * 100)}%`
    : "—";

  return (
    <div className={READING_PAGE_CONTAINER}>
      <section className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-center gap-5">
          <span className="rd-accent-gradient flex h-20 w-20 shrink-0 items-center justify-center rounded-full font-display text-2xl font-bold text-black/80">
            {initials(user.full_name)}
          </span>
          <div className="min-w-0">
            <h1 className="font-display text-3xl font-semibold leading-tight text-[var(--rd-text)] sm:text-4xl">
              {user.full_name}
            </h1>
            <p className="mt-1.5 text-sm text-[var(--rd-text-muted)]">
              @{user.email.split("@")[0]}, reading since {memberSinceLabel(user.created_at)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-3 rounded-xl border border-[var(--rd-border)] bg-[var(--rd-panel)] px-4 py-3">
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
                {streak}-day streak
              </p>
              <p className="text-[11px] text-[var(--rd-text-muted)]">
                {streak > 0 ? "Keep it lit: open the app tomorrow" : "Check in daily to start one"}
              </p>
            </div>
          </div>

          <Link
            href={"/reading/team" as Route}
            className="rounded-xl border border-[var(--rd-border)] bg-[var(--rd-panel)] px-4 py-3 transition-colors hover:border-[var(--rd-accent-from)]/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rd-accent-from)]"
          >
            <p className="font-display text-[15px] font-semibold leading-tight text-[var(--rd-text)]">
              {user.team_name ?? "No team yet"}
            </p>
            <p className="text-[11px] text-[var(--rd-text-muted)]">
              {team ? `Place ${team.place} of ${team.teams_total}, ${team.points} team points` : "Team standing loading"}
            </p>
          </Link>
        </div>
      </section>

      {loadError ? (
        <p className="mt-10 text-sm text-[var(--rd-text-muted)]">{loadError} Refresh the page to try again.</p>
      ) : (
        <>
          <section
            aria-label="Season stats"
            className="mt-10 grid grid-cols-2 gap-x-6 gap-y-7 divide-[var(--rd-border)] border-y border-[var(--rd-border)] py-6 sm:grid-cols-3 lg:grid-cols-6 lg:gap-x-0 lg:divide-x"
          >
            <LedgerItem value={stats ? String(stats.quiz_points) : "—"} label="Quiz points" hint="Counts toward your team" />
            <LedgerItem
              value={accuracy}
              label="Quiz accuracy"
              hint={stats ? `${stats.answers_correct} of ${stats.answers_total} right` : undefined}
            />
            <LedgerItem value={stats ? String(stats.quiz_nights) : "—"} label="Quiz nights played" />
            <LedgerItem value={stats ? stats.pages_read.toLocaleString("en-US") : "—"} label="Pages read" />
            <LedgerItem value={stats ? String(stats.books_finished) : "—"} label="Books finished" />
            <LedgerItem value={stats ? String(stats.votes_cast) : "—"} label="Votes cast" />
          </section>

          <section className="mt-10">
            <h2 className="font-display text-xl font-semibold text-[var(--rd-text)]">Your shelf</h2>
            <p className="mb-6 mt-1 text-[13px] text-[var(--rd-text-muted)]">
              Every book you&apos;ve logged pages on, newest first. The ember shows how far you are.
            </p>
            {stats ? (
              <ReaderShelf shelf={stats.shelf} />
            ) : (
              <p className="text-sm text-[var(--rd-text-muted)]">Loading your shelf…</p>
            )}
          </section>
        </>
      )}
    </div>
  );
}
