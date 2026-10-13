import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { initials } from "@berea/core";
import type { RoundDayProgress } from "@/features/reading/lib/roundCalendar";

interface ReadingTopbarProps {
  seasonLabel: string | null;
  roundIndex:  number;
  roundTotal:  number;
  dayProgress: RoundDayProgress | null;
  totalPoints: number;
  userName:    string | null;
}

function roundSummary(seasonLabel: string | null, roundIndex: number, roundTotal: number, day: RoundDayProgress | null): string {
  const parts = [seasonLabel, `Round ${roundIndex} of ${roundTotal}`];
  if (day) {
    parts.push(`Day ${day.dayNumber} of ${day.totalDays}`);
    parts.push(day.daysLeft > 0 ? `${day.daysLeft} ${day.daysLeft === 1 ? "day" : "days"} left` : "Last day");
  }
  return parts.filter(Boolean).join(" · ");
}

export function ReadingTopbar({ seasonLabel, roundIndex, roundTotal, dayProgress, totalPoints, userName }: ReadingTopbarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--rd-border)] bg-[var(--rd-panel)] px-4 md:px-6">
      <Link href={"/reading" as Route} className="flex min-w-0 items-center gap-2.5">
        <Image src="/logo_451.png" alt="451° gradus" width={32} height={32} priority className="h-8 w-8 shrink-0 rounded-full" />
        <span className="font-display truncate text-[14px] font-semibold tracking-tight text-[var(--rd-text)]">
          NATS SPIREA
        </span>
        {roundTotal > 0 && (
          <span className="hidden truncate text-[12px] text-[var(--rd-text-muted)] sm:inline">
            · {roundSummary(seasonLabel, roundIndex, roundTotal, dayProgress)}
          </span>
        )}
      </Link>

      <div className="flex shrink-0 items-center gap-3">
        <span
          title="Team points this season"
          className="rd-accent-gradient rounded-full px-3 py-1 text-[12px] font-semibold text-black/80"
        >
          {totalPoints} pts
        </span>
        <span
          title={userName ?? undefined}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--rd-border)] bg-[var(--rd-ink)] text-[11px] font-semibold text-[var(--rd-text)]"
        >
          {userName ? initials(userName) : ""}
        </span>
      </div>
    </header>
  );
}
