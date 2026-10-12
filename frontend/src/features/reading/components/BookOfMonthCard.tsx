"use client";

import Link from "next/link";
import type { Route } from "next";
import { BookOpen, PenLine, Vote } from "lucide-react";
import { ProgressBar } from "@berea/ui-kit";
import { bookCoverSrc, type BookOfMonthResult } from "@berea/api";

interface BookOfMonthCardProps {
  result:     BookOfMonthResult | null;
  isLoading:  boolean;
  onLogPages: () => void;
}

export function BookOfMonthCard({ result, isLoading, onLogPages }: BookOfMonthCardProps) {
  if (isLoading) {
    return <div className="h-60 animate-pulse rounded-2xl border border-[var(--rd-border)] bg-[var(--rd-panel)]" />;
  }

  if (!result) {
    return (
      <div className="flex h-full flex-col justify-center gap-4 rounded-2xl border border-dashed border-[var(--rd-border)] bg-[var(--rd-panel)] p-7">
        <BookOpen size={28} className="text-[var(--rd-accent-from)]" />
        <div>
          <p className="text-xs uppercase tracking-[0.15em] text-[var(--rd-text-muted)]">Book of the month</p>
          <h3 className="font-display mt-1.5 text-xl font-semibold text-[var(--rd-text)]">Not chosen yet</h3>
          <p className="mt-1 text-sm text-[var(--rd-text-muted)]">
            It appears here as soon as the book vote closes — language, then genre, then the book.
          </p>
        </div>
        <Link
          href={"/reading/games" as Route}
          className="inline-flex w-fit items-center gap-2 rounded-lg border border-[var(--rd-border)] px-4 py-2 text-sm font-medium text-[var(--rd-text)] transition-colors hover:border-[var(--rd-accent-from)]"
        >
          <Vote size={15} />
          Go to the vote
        </Link>
      </div>
    );
  }

  const { book, chosen_by_percent, your_page, team_average_percent } = result;
  const cover = bookCoverSrc(book.cover_url);
  const yourPercent = book.page_count ? Math.round((Math.min(your_page, book.page_count) / book.page_count) * 100) : 0;

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-[var(--rd-border)] bg-[var(--rd-panel)] p-7 sm:flex-row">
      <div className="relative flex h-44 w-32 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-[var(--rd-accent-from)] to-[#3a1f10] shadow-[inset_-4px_0_0_rgba(0,0,0,0.35)]">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element -- admin-supplied cover from our API or an external URL
          <img src={cover} alt={`${book.title} cover`} className="h-full w-full object-cover" />
        ) : (
          <span className="font-display select-none text-6xl font-bold text-black/15" aria-hidden="true">
            {book.title.charAt(0)}
          </span>
        )}
      </div>

      <div className="flex-1">
        <p className="text-xs uppercase tracking-[0.15em] text-[var(--rd-text-muted)]">
          Book of the month{book.language ? ` · ${book.language}` : ""}{book.genre ? ` · ${book.genre}` : ""}
        </p>
        <h3 className="font-display mt-1.5 text-2xl font-semibold text-[var(--rd-text)]">{book.title}</h3>
        <p className="mt-1 text-sm text-[var(--rd-text-muted)]">
          Chosen by {chosen_by_percent}% of voters{book.page_count ? ` · ${book.page_count} pages` : ""}
        </p>

        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--rd-text-muted)]">
              Your progress · p. {your_page}
              {book.page_count ? ` of ${book.page_count}` : ""}
            </span>
            <span className="font-medium text-[var(--rd-text)]">{yourPercent}%</span>
          </div>
          <ProgressBar percent={yourPercent} />
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--rd-text-muted)]">Team average</span>
            <span className="font-medium text-[var(--rd-text)]">{team_average_percent}%</span>
          </div>
          <ProgressBar percent={team_average_percent} tone="muted" />
        </div>

        <button
          type="button"
          onClick={onLogPages}
          className="mt-5 inline-flex items-center gap-2 rounded-lg border border-[var(--rd-border)] px-4 py-2 text-sm font-medium text-[var(--rd-text)] transition-colors hover:border-[var(--rd-accent-from)]"
        >
          <PenLine size={14} />
          Log pages
        </button>
      </div>
    </div>
  );
}
