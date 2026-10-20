import { useLocale, useTranslations } from "next-intl";
import type { QuizNight } from "@/features/reading/types";
import { formatVoteDateTime } from "@/features/reading/lib/formatReadingDate";

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

interface QuizNightCardProps {
  quizNight: QuizNight;
}

export function QuizNightCard({ quizNight }: QuizNightCardProps) {
  const t = useTranslations("reading.quizNight");
  const locale = useLocale();
  return (
    <div className="flex flex-col rounded-2xl border border-[var(--rd-border)] bg-[var(--rd-panel)] p-7">
      <p className="text-xs uppercase tracking-[0.15em] text-[var(--rd-text-muted)]">{t("title")}</p>

      <div className="mt-4 flex items-center justify-center gap-6">
        <CountdownUnit value={quizNight.daysLeft} label={t("units.days")} />
        <CountdownUnit value={quizNight.hoursLeft} label={t("units.hours")} />
        <CountdownUnit value={quizNight.minutesLeft} label={t("units.minutes")} />
      </div>

      <p className="mt-6 text-center text-base text-[var(--rd-text)]">{formatVoteDateTime(quizNight.startsAt, locale)}</p>
      <p className="text-center text-sm text-[var(--rd-text-muted)]">{t("location", { location: quizNight.location, count: quizNight.teamsCount })}</p>

      <button className="rd-accent-gradient mt-5 rounded-lg py-3 text-sm font-semibold text-black/85">
        {t("reserve")}
      </button>
      <p className="mt-2 text-center text-xs text-[var(--rd-text-muted)]">{t("entryNote")}</p>
    </div>
  );
}
