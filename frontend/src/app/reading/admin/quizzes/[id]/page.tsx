"use client";

import { use } from "react";
import Link from "next/link";
import { useReadingQuizStore } from "@/features/reading/store/useReadingQuizStore";
import { QuizBuilder } from "@/features/reading/components/admin/QuizBuilder";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ReadingAdminEditQuizPage({ params }: PageProps) {
  const { id } = use(params);
  const quiz = useReadingQuizStore((s) => s.quizzes.find((q) => q.id === id));

  if (!quiz) {
    return (
      <div className="mx-auto w-full max-w-[1600px] px-8 py-10 lg:px-12">
        <p className="text-sm text-[var(--rd-text-muted)]">
          That quiz doesn&apos;t exist anymore.{" "}
          <Link href="/reading/admin" className="font-medium text-[var(--rd-text)] hover:underline">
            Back to quizzes
          </Link>
        </p>
      </div>
    );
  }

  return <QuizBuilder key={quiz.id} initialQuiz={quiz} />;
}
