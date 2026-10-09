import type { QuizNight } from "@/features/reading/types";

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
  return (
    <div className="flex flex-col rounded-2xl border border-[var(--rd-border)] bg-[var(--rd-panel)] p-7">
      <p className="text-xs uppercase tracking-[0.15em] text-[var(--rd-text-muted)]">Next quiz night</p>

      <div className="mt-4 flex items-center justify-center gap-6">
        <CountdownUnit value={quizNight.daysLeft} label="days" />
        <CountdownUnit value={quizNight.hoursLeft} label="hrs" />
        <CountdownUnit value={quizNight.minutesLeft} label="min" />
      </div>

      <p className="mt-6 text-center text-base text-[var(--rd-text)]">{quizNight.dateLabel}</p>
      <p className="text-center text-sm text-[var(--rd-text-muted)]">{quizNight.location}</p>

      <button className="rd-accent-gradient mt-5 rounded-lg py-3 text-sm font-semibold text-black/85">
        I&apos;m in — reserve seat
      </button>
      <p className="mt-2 text-center text-xs text-[var(--rd-text-muted)]">{quizNight.entryNote}</p>
    </div>
  );
}
