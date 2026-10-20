"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { useTranslations } from "next-intl";
import { Gamepad2, Loader2, Pencil, Plus, Radio, Trash2 } from "lucide-react";
import { isApiError } from "@/features/auth/utils";
import { readingQuizApi } from "@berea/api";
import { readingLiveQuizApi } from "@berea/api";
import type { Quiz } from "@berea/api";
import { ReadingPageHero } from "@/features/reading/components/layout/ReadingPageHero";
import { READING_PAGE_CONTAINER } from "@/features/reading/lib/pageContainer";

interface CountdownParts {
  days:    number;
  hours:   number;
  minutes: number;
}

function countdownParts(scheduledFor: string): CountdownParts | null {
  const diffMs = new Date(scheduledFor).getTime() - Date.now();
  if (diffMs <= 0) return null;
  const totalMinutes = Math.floor(diffMs / 60_000);
  return {
    days:    Math.floor(totalMinutes / (60 * 24)),
    hours:   Math.floor((totalMinutes % (60 * 24)) / 60),
    minutes: totalMinutes % 60,
  };
}

interface QuizCardProps {
  quiz:       Quiz;
  onDelete:   (id: string) => void;
  onGoLive:   (id: string) => void;
  isStarting: boolean;
}

function QuizCard({ quiz, onDelete, onGoLive, isStarting }: QuizCardProps) {
  const t = useTranslations("reading.admin.quizzes");
  const countdown = quiz.scheduledFor ? countdownParts(quiz.scheduledFor) : null;
  const countdownLabel = !quiz.scheduledFor
    ? t("notScheduled")
    : !countdown
      ? t("startingSoon")
      : countdown.days > 0
        ? t("countdownDays", { ...countdown })
        : t("countdownHours", { hours: countdown.hours, minutes: countdown.minutes });

  return (
    <div className="group relative flex w-64 shrink-0 flex-col justify-between rounded-2xl border border-[var(--rd-border)] bg-[var(--rd-panel)] p-6">
      <div>
        <p className="font-display text-lg font-semibold text-[var(--rd-text)]">{quiz.title}</p>
        <p className="mt-1 text-xs text-[var(--rd-text-muted)]">
          {quiz.monthLabel} · {t("questionCount", { count: quiz.questions.length })}
        </p>
      </div>

      <div className="mt-8">
        <p className="text-sm font-medium text-[var(--rd-text)]">{countdownLabel}</p>
        <p className="text-xs text-[var(--rd-text-muted)]">
          {quiz.status === "scheduled" ? t("untilNext") : t("draft")}
        </p>
        <button
          type="button"
          onClick={() => onGoLive(quiz.id)}
          disabled={isStarting || quiz.questions.length === 0}
          title={quiz.questions.length === 0 ? t("addQuestionsFirst") : undefined}
          className="rd-accent-gradient mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold text-black/85 transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isStarting ? <Loader2 size={14} className="animate-spin" /> : <Radio size={14} />}
          {t("goLive")}
        </button>
      </div>

      <div className="absolute right-3 top-3 hidden items-center gap-1 group-hover:flex">
        <Link
          href={`/reading/admin/quizzes/${quiz.id}` as Route}
          aria-label={t("edit")}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--rd-border)] bg-[var(--rd-ink)] text-[var(--rd-text-muted)] transition-colors hover:text-[var(--rd-text)]"
        >
          <Pencil size={13} />
        </Link>
        <button
          onClick={() => onDelete(quiz.id)}
          aria-label={t("delete")}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--rd-border)] bg-[var(--rd-ink)] text-[var(--rd-text-muted)] transition-colors hover:text-red-400"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

export default function ReadingAdminOverviewPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startingId, setStartingId] = useState<string | null>(null);
  const router = useRouter();
  const t = useTranslations("reading.admin.quizzes");
  const tCommon = useTranslations("reading.admin.common");

  useEffect(() => {
    readingQuizApi
      .list()
      .then(setQuizzes)
      .catch((err) => setError(isApiError(err) ? err.detail : t("loadError")))
      .finally(() => setIsLoading(false));
  }, [t]);

  async function goLive(id: string) {
    setStartingId(id);
    setError(null);
    try {
      const session = await readingLiveQuizApi.start(id);
      router.push(`/reading/admin/live/${session.id}` as Route);
    } catch (err) {
      setError(isApiError(err) ? err.detail : t("startError"));
      setStartingId(null);
    }
  }

  async function deleteQuiz(id: string) {
    const quiz = quizzes.find((q) => q.id === id);
    if (!window.confirm(t("deleteConfirm", { title: quiz?.title ?? t("thisQuiz") }))) return;
    try {
      await readingQuizApi.remove(id);
      setQuizzes((prev) => prev.filter((q) => q.id !== id));
    } catch (err) {
      setError(isApiError(err) ? err.detail : t("deleteError"));
    }
  }

  return (
    <div className={READING_PAGE_CONTAINER}>
      <ReadingPageHero
        eyebrow={tCommon("eyebrow")}
        eyebrowIcon={Gamepad2}
        title={t("title")}
        description={t("description")}
        aside={
            <Link
              href={"/reading/admin/quizzes/new" as Route}
              className="rd-accent-gradient inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-black/85 transition-opacity hover:opacity-90"
            >
              <Plus size={15} />
              {t("create")}
            </Link>
        }
      />

      {error && (
        <p role="alert" className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
          {error}
        </p>
      )}

      {isLoading ? (
        <div className="mt-8 flex flex-wrap gap-5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-44 w-64 animate-pulse rounded-2xl border border-[var(--rd-border)] bg-[var(--rd-panel)]" />
          ))}
        </div>
      ) : quizzes.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-[var(--rd-border)] p-10 text-center">
          <p className="text-sm text-[var(--rd-text-muted)]">
            {t("empty")}
          </p>
        </div>
      ) : (
        <div className="mt-8 flex flex-wrap gap-5">
          {quizzes.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} onDelete={deleteQuiz} onGoLive={goLive} isStarting={startingId === quiz.id} />
          ))}
        </div>
      )}
    </div>
  );
}
