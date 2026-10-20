"use client";

import { useState } from "react";
import { Check, RotateCcw, Sparkles, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { readingQuizNightApi, type NightGrade, type NightMarkingQuestion, type NightState } from "@berea/api";
import { isApiError } from "@/features/auth/utils";
import { cn } from "@/shared/lib/utils";

interface MarkingPanelProps {
  sessionId: string;
  marking:   NightMarkingQuestion[];
  onChange:  (state: NightState) => void;
}

/** Host-only, during the ANSWERS break: every team's answer with the automatic verdict to confirm. */
export function MarkingPanel({ sessionId, marking, onChange }: MarkingPanelProps) {
  const t = useTranslations("reading.night.marking");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function grade(answerId: string, value: NightGrade | null) {
    setPendingId(answerId);
    setError(null);
    try {
      onChange(await readingQuizNightApi.grade(sessionId, answerId, value));
    } catch (err) {
      setError(isApiError(err) ? err.detail : t("error"));
    } finally {
      setPendingId(null);
    }
  }

  return (
    <section className="w-full max-w-6xl rounded-3xl border border-[var(--rd-border)] bg-[var(--rd-panel)] p-5 sm:p-8" aria-labelledby="marking-title">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--rd-accent-from)]">{t("eyebrow")}</p>
          <h2 id="marking-title" className="font-display mt-1 text-2xl font-semibold text-[var(--rd-text)]">{t("title")}</h2>
        </div>
        <p className="flex items-center gap-1.5 text-xs text-[var(--rd-text-muted)]"><Sparkles size={13} /> {t("hint")}</p>
      </div>
      {error && <p role="alert" className="mt-4 rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-400">{error}</p>}

      <div className="mt-6 space-y-6">
        {marking.map((item) => (
          <div key={item.question.id}>
            <p className="text-sm font-semibold text-[var(--rd-text)]">
              {item.question_number}. {item.question.text}
            </p>
            <p className="mt-0.5 text-xs text-emerald-400">{t("correctAnswer", { answer: item.correct_text })}</p>
            {item.answers.length === 0 ? (
              <p className="mt-2 text-sm text-[var(--rd-text-muted)]">{t("noAnswers")}</p>
            ) : (
              <ul className="mt-3 divide-y divide-[var(--rd-border)] rounded-xl border border-[var(--rd-border)]">
                {item.answers.map((answer) => (
                  <li key={answer.id} className="flex flex-wrap items-center gap-3 px-4 py-2.5">
                    <span className="w-32 shrink-0 truncate text-xs font-semibold text-[var(--rd-text-muted)]">{answer.team_name}</span>
                    <span className="min-w-0 flex-1 break-words text-sm text-[var(--rd-text)]">{answer.text}</span>
                    {answer.overridden && (
                      <button
                        type="button"
                        onClick={() => void grade(answer.id, null)}
                        disabled={pendingId === answer.id}
                        aria-label={t("resetToAuto")}
                        title={t("resetToAuto")}
                        className="text-[var(--rd-text-muted)] hover:text-[var(--rd-text)] disabled:opacity-50"
                      >
                        <RotateCcw size={14} />
                      </button>
                    )}
                    <div className="flex gap-1.5">
                      {(["correct", "wrong"] as const).map((value) => {
                        const active = answer.grade === value;
                        const Icon = value === "correct" ? Check : X;
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => void grade(answer.id, value)}
                            disabled={pendingId === answer.id || active}
                            aria-pressed={active}
                            aria-label={t(value)}
                            className={cn(
                              "flex h-8 w-8 items-center justify-center rounded-lg border transition-colors disabled:cursor-default",
                              active && value === "correct" && "border-emerald-400 bg-emerald-400/15 text-emerald-400",
                              active && value === "wrong" && "border-red-400 bg-red-500/15 text-red-400",
                              !active && "border-[var(--rd-border)] text-[var(--rd-text-muted)] hover:text-[var(--rd-text)]",
                            )}
                          >
                            <Icon size={15} />
                          </button>
                        );
                      })}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
