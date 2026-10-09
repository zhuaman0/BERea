"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Quiz } from "@/features/reading/quizTypes";

interface ReadingQuizState {
  quizzes: Quiz[];
  upsertQuiz: (quiz: Quiz) => void;
  deleteQuiz: (id: string) => void;
}

const SEED_QUIZZES: Quiz[] = [
  {
    id:           "quiz-3",
    title:        "Quiz #3",
    monthLabel:   "October",
    scheduledFor: new Date(Date.now() + 32 * 60 * 60 * 1000).toISOString(),
    status:       "scheduled",
    questions:    [],
  },
];

// No backend for the reading league's quizzes yet — this is the same
// mock-until-wired-up pattern as the rest of the reading module, just kept
// in a persisted store so quizzes an admin builds survive a page reload.
export const useReadingQuizStore = create<ReadingQuizState>()(
  persist(
    (set) => ({
      quizzes: SEED_QUIZZES,

      upsertQuiz(quiz) {
        set((s) => {
          const exists = s.quizzes.some((q) => q.id === quiz.id);
          return {
            quizzes: exists
              ? s.quizzes.map((q) => (q.id === quiz.id ? quiz : q))
              : [quiz, ...s.quizzes],
          };
        });
      },

      deleteQuiz(id) {
        set((s) => ({ quizzes: s.quizzes.filter((q) => q.id !== id) }));
      },
    }),
    {
      name:    "nats-admin-quizzes",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
