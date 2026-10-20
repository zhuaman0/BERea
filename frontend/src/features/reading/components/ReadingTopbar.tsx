import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { useTranslations } from "next-intl";
import { initials } from "@berea/core";
import type { RoundDayProgress, Semester } from "@/features/reading/lib/roundCalendar";
import { ReadingLocaleSwitcher } from "@/features/reading/components/ReadingLocaleSwitcher";

interface ReadingTopbarProps {
  semester:    Semester | null;
  roundIndex:  number;
  roundTotal:  number;
  isRegistrationPhase: boolean;
  dayProgress: RoundDayProgress | null;
  /** The team's season points; null while loading, and the pill is hidden when there is no team. */
  totalPoints: number | null;
  hasTeam:     boolean;
  userName:    string | null;
}

export function ReadingTopbar({ semester, roundIndex, roundTotal, isRegistrationPhase, dayProgress, totalPoints, hasTeam, userName }: ReadingTopbarProps) {
  const t = useTranslations("reading.shell.topbar");

  function roundSummary(): string {
    const semesterLabel = semester ? t("semester", { term: semester.term, year: String(semester.year) }) : null;
    if (isRegistrationPhase) return [semesterLabel, t("registrationOpen")].filter(Boolean).join(" · ");
    const parts = [semesterLabel, t("round", { index: roundIndex, total: roundTotal })];
    if (dayProgress) {
      parts.push(t("day", { day: dayProgress.dayNumber, total: dayProgress.totalDays }));
      parts.push(dayProgress.daysLeft > 0 ? t("daysLeft", { count: dayProgress.daysLeft }) : t("lastDay"));
    }
    return parts.filter(Boolean).join(" · ");
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--rd-border)] bg-[var(--rd-panel)] px-4 md:px-6">
      <Link href={"/reading" as Route} className="flex min-w-0 items-center gap-2.5">
        <Image src="/logo_451.png" alt="451° gradus" width={32} height={32} priority className="h-8 w-8 shrink-0 rounded-full" />
        <span className="font-display truncate text-[14px] font-semibold tracking-tight text-[var(--rd-text)]">
          NATS SPIREA
        </span>
        {(roundTotal > 0 || isRegistrationPhase) && (
          <span className="hidden truncate text-[12px] text-[var(--rd-text-muted)] sm:inline">
            · {roundSummary()}
          </span>
        )}
      </Link>

      <div className="flex shrink-0 items-center gap-3">
        <ReadingLocaleSwitcher className="hidden sm:flex" />
        {hasTeam && (totalPoints === null ? (
          <span aria-hidden="true" className="h-[26px] w-16 animate-pulse rounded-full bg-[var(--rd-border)]" />
        ) : (
          <Link
            href={"/reading/leaderboard" as Route}
            title={t("pointsTitle")}
            className="rd-accent-gradient rounded-full px-3 py-1 text-[12px] font-semibold tabular-nums text-black/80 transition-opacity hover:opacity-90"
          >
            {t("points", { count: totalPoints })}
          </Link>
        ))}
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
