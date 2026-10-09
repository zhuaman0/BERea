"use client";

import Link from "next/link";
import type { Route } from "next";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useReadingQuizStore } from "@/features/reading/store/useReadingQuizStore";
import type { Quiz } from "@/features/reading/quizTypes";

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

function QuizCard({ quiz, onDelete }: { quiz: Quiz; onDelete: (id: string) => void }) {
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
  const quizzes = useReadingQuizStore((s) => s.quizzes);
  const deleteQuiz = useReadingQuizStore((s) => s.deleteQuiz);

  return (
    <div className="mx-auto w-full max-w-[1600px] px-8 py-10 lg:px-12">
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

      {quizzes.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-[var(--rd-border)] p-10 text-center">
          <p className="text-sm text-[var(--rd-text-muted)]">
            No quizzes yet — create one to start building questions.
          </p>
        </div>
      ) : (
        <div className="mt-8 flex flex-wrap gap-5">
          {quizzes.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} onDelete={deleteQuiz} />
          ))}
        </div>
      )}
    </div>
  );
}
