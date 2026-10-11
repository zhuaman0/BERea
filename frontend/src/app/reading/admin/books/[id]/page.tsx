"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { isApiError } from "@/features/auth/utils";
import { readingBookApi } from "@/features/reading/bookApi";
import { BookForm } from "@/features/reading/components/admin/BookForm";
import type { ReadingBook } from "@/features/reading/bookTypes";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ReadingAdminEditBookPage({ params }: PageProps) {
  const { id } = use(params);
  const [book, setBook] = useState<ReadingBook | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    readingBookApi
      .get(id)
      .then(setBook)
      .catch((err) => setError(isApiError(err) ? err.detail : "Couldn't load that book."));
  }, [id]);

  if (error) {
    return (
      <div className="w-full px-4 py-6 sm:px-8 sm:py-10 lg:px-12">
        <p className="text-sm text-[var(--rd-text-muted)]">
          {error}{" "}
          <Link href="/reading/admin/books" className="font-medium text-[var(--rd-text)] hover:underline">
            Back to books
          </Link>
        </p>
      </div>
    );
  }

  if (!book) {
    return <div className="m-8 h-64 max-w-3xl animate-pulse rounded-2xl bg-[var(--rd-panel)]" aria-label="Loading book" />;
  }

  return <BookForm key={book.id} initialBook={book} />;
}
