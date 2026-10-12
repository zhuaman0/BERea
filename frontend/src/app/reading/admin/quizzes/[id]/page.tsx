"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { isApiError } from "@/features/auth/utils";
import { readingQuizApi } from "@berea/api";
import { QuizBuilder } from "@/features/reading/components/admin/QuizBuilder";
import type { Quiz } from "@berea/api";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ReadingAdminEditQuizPage({ params }: PageProps) {
  const { id } = use(params);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    readingQuizApi
      .get(id)
      .then(setQuiz)
      .catch((err) => setError(isApiError(err) ? err.detail : "Couldn't load that quiz."));
  }, [id]);

  if (error) {
    return (
      <div className="w-full px-4 py-6 sm:px-8 sm:py-10 lg:px-12">
        <p className="text-sm text-[var(--rd-text-muted)]">
          {error}{" "}
          <Link href="/reading/admin" className="font-medium text-[var(--rd-text)] hover:underline">
            Back to quizzes
          </Link>
        </p>
      </div>
    );
  }

  if (!quiz) {
    return <div className="m-8 h-64 max-w-3xl animate-pulse rounded-2xl bg-[var(--rd-panel)]" aria-label="Loading quiz" />;
  }

  return <QuizBuilder key={quiz.id} initialQuiz={quiz} />;
}
