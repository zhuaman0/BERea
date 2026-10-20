"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { isApiError } from "@/features/auth/utils";
import { readingQuizApi } from "@berea/api";
import { QuizBuilder } from "@/features/reading/components/admin/QuizBuilder";
import { QuizNightBuilder } from "@/features/reading/components/admin/QuizNightBuilder";
import type { Quiz } from "@berea/api";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ReadingAdminEditQuizPage({ params }: PageProps) {
  const { id } = use(params);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations("reading.admin.quizEdit");

  useEffect(() => {
    readingQuizApi
      .get(id)
      .then(setQuiz)
      .catch((err) => setError(isApiError(err) ? err.detail : t("loadError")));
  }, [id, t]);

  if (error) {
    return (
      <div className="w-full px-4 py-6 sm:px-8 sm:py-10 lg:px-12">
        <p className="text-sm text-[var(--rd-text-muted)]">
          {error}{" "}
          <Link href="/reading/admin" className="font-medium text-[var(--rd-text)] hover:underline">
            {t("back")}
          </Link>
        </p>
      </div>
    );
  }

  if (!quiz) {
    return <div className="m-8 h-64 max-w-3xl animate-pulse rounded-2xl bg-[var(--rd-panel)]" aria-label={t("loading")} />;
  }

  return quiz.format === "rounds"
    ? <QuizNightBuilder key={quiz.id} initialQuiz={quiz} />
    : <QuizBuilder key={quiz.id} initialQuiz={quiz} />;
}
