"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AdminBook } from "@/features/reading/bookTypes";

interface ReadingBookState {
  books: AdminBook[];
  upsertBook: (book: AdminBook) => void;
  deleteBook: (id: string) => void;
}

// Same mock-until-wired-up pattern as the quiz store — no backend book
// catalog exists yet, so admin-authored books live in a persisted local
// store until a real books table/API is built.
export const useReadingBookStore = create<ReadingBookState>()(
  persist(
    (set) => ({
      books: [],

      upsertBook(book) {
        set((s) => {
          const exists = s.books.some((b) => b.id === book.id);
          return {
            books: exists ? s.books.map((b) => (b.id === book.id ? book : b)) : [book, ...s.books],
          };
        });
      },

      deleteBook(id) {
        set((s) => ({ books: s.books.filter((b) => b.id !== id) }));
      },
    }),
    {
      name:    "nats-admin-books",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
