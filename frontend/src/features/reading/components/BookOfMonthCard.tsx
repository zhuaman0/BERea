import type { BookOfMonth } from "@/features/reading/types";

interface ProgressBarProps {
  percent: number;
  tone?: "accent" | "muted";
}

function ProgressBar({ percent, tone = "accent" }: ProgressBarProps) {
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--rd-border)]">
      <div
        className={`h-full rounded-full ${tone === "accent" ? "rd-accent-gradient" : "bg-[var(--rd-text-muted)]"}`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

interface BookOfMonthCardProps {
  book: BookOfMonth;
}

export function BookOfMonthCard({ book }: BookOfMonthCardProps) {
  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-[var(--rd-border)] bg-[var(--rd-panel)] p-7 sm:flex-row">
      <div
        className="relative flex h-44 w-32 shrink-0 items-center justify-center overflow-hidden rounded-lg"
        style={{
          background: "linear-gradient(145deg, var(--rd-accent-from), #3a1f10)",
          boxShadow: "inset -4px 0 0 rgba(0,0,0,.35)",
        }}
      >
        <span className="absolute left-3 right-3 top-5 h-px bg-white/20" aria-hidden="true" />
        <span className="absolute left-3 right-3 top-7 h-px bg-white/10" aria-hidden="true" />
        <span className="font-display select-none text-6xl font-bold text-black/15" aria-hidden="true">
          {book.title.charAt(0)}
        </span>
      </div>

      <div className="flex-1">
        <p className="text-xs uppercase tracking-[0.15em] text-[var(--rd-text-muted)]">
          Book of the month · {book.monthLabel}
        </p>
        <h3 className="font-display mt-1.5 text-2xl font-semibold text-[var(--rd-text)]">{book.title}</h3>
        <p className="mt-1 text-sm text-[var(--rd-text-muted)]">
          Chosen by {book.chosenByPercent}% of players · {book.pageCount} pages
        </p>

        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--rd-text-muted)]">
              Your progress · p. {book.yourPage} of {book.pageCount}
            </span>
            <span className="font-medium text-[var(--rd-text)]">{book.yourProgressPercent}%</span>
          </div>
          <ProgressBar percent={book.yourProgressPercent} />
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--rd-text-muted)]">Team average</span>
            <span className="font-medium text-[var(--rd-text)]">{book.teamAveragePercent}%</span>
          </div>
          <ProgressBar percent={book.teamAveragePercent} tone="muted" />
        </div>
      </div>
    </div>
  );
}
