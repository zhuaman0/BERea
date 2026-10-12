"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { Loader2, Pencil, Plus, Radio, Trash2 } from "lucide-react";
import { isApiError } from "@/features/auth/utils";
import { readingQuizApi } from "@berea/api";
import { readingLiveQuizApi } from "@berea/api";
import type { Quiz } from "@berea/api";

function countdownLabel(scheduledFor: string | null): string {
  if (!scheduledFor) return "Not scheduled";
  const diffMs = new Date(scheduledFor).getTime() - Date.now();
  if (diffMs <= 0) return "Starting soon";
  const totalMinutes = Math.floor(diffMs / 60_000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  return days > 0 ? `${days}d ${hours}h ${minutes}min` : `${hours}h ${minutes}min`;
}

interface QuizCardProps {
  quiz:       Quiz;
  onDelete:   (id: string) => void;
  onGoLive:   (id: string) => void;
  isStarting: boolean;
}

function QuizCard({ quiz, onDelete, onGoLive, isStarting }: QuizCardProps) {
  return (
    <div className="group relative flex w-64 shrink-0 flex-col justify-between rounded-2xl border border-[var(--rd-border)] bg-[var(--rd-panel)] p-6">
      <div>
        <p className="font-display text-lg font-semibold text-[var(--rd-text)]">{quiz.title}</p>
        <p className="mt-1 text-xs text-[var(--rd-text-muted)]">
          {quiz.monthLabel} · {quiz.questions.length} question{quiz.questions.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="mt-8">
        <p className="text-sm font-medium text-[var(--rd-text)]">{countdownLabel(quiz.scheduledFor)}</p>
        <p className="text-xs text-[var(--rd-text-muted)]">
          {quiz.status === "scheduled" ? "Until next game" : "Draft"}
        </p>
        <button
          type="button"
          onClick={() => onGoLive(quiz.id)}
          disabled={isStarting || quiz.questions.length === 0}
          title={quiz.questions.length === 0 ? "Add questions first" : undefined}
          className="rd-accent-gradient mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold text-black/85 transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isStarting ? <Loader2 size={14} className="animate-spin" /> : <Radio size={14} />}
          Go live
        </button>
      </div>

      <div className="absolute right-3 top-3 hidden items-center gap-1 group-hover:flex">
        <Link
          href={`/reading/admin/quizzes/${quiz.id}` as Route}
          aria-label="Edit quiz"
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--rd-border)] bg-[var(--rd-ink)] text-[var(--rd-text-muted)] transition-colors hover:text-[var(--rd-text)]"
        >
          <Pencil size={13} />
        </Link>
        <button
          onClick={() => onDelete(quiz.id)}
          aria-label="Delete quiz"
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

  useEffect(() => {
    readingQuizApi
      .list()
      .then(setQuizzes)
      .catch((err) => setError(isApiError(err) ? err.detail : "Couldn't load quizzes."))
      .finally(() => setIsLoading(false));
  }, []);

  async function goLive(id: string) {
    setStartingId(id);
    setError(null);
    try {
      const session = await readingLiveQuizApi.start(id);
      router.push(`/reading/admin/live/${session.id}` as Route);
    } catch (err) {
      setError(isApiError(err) ? err.detail : "Couldn't start the live quiz.");
      setStartingId(null);
    }
  }

  async function deleteQuiz(id: string) {
    const quiz = quizzes.find((q) => q.id === id);
    if (!window.confirm(`Delete "${quiz?.title ?? "this quiz"}"? This can't be undone.`)) return;
    try {
      await readingQuizApi.remove(id);
      setQuizzes((prev) => prev.filter((q) => q.id !== id));
    } catch (err) {
      setError(isApiError(err) ? err.detail : "Couldn't delete that quiz.");
    }
  }

  return (
    <div className="w-full px-4 py-6 sm:px-8 sm:py-10 lg:px-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[var(--rd-text)]">Quizzes</h1>
          <p className="mt-1 text-sm text-[var(--rd-text-muted)]">
            Build the questions and answers for each quiz night.
          </p>
        </div>
        <Link
          href={"/reading/admin/quizzes/new" as Route}
          className="rd-accent-gradient inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-black/85 transition-opacity hover:opacity-90"
        >
          <Plus size={15} />
          Create Quiz
        </Link>
      </div>

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
            No quizzes yet — create one to start building questions.
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
