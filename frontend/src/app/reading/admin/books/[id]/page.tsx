"use client";

import { use } from "react";
import Link from "next/link";
import { useReadingBookStore } from "@/features/reading/store/useReadingBookStore";
import { BookForm } from "@/features/reading/components/admin/BookForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ReadingAdminEditBookPage({ params }: PageProps) {
  const { id } = use(params);
  const book = useReadingBookStore((s) => s.books.find((b) => b.id === id));

  if (!book) {
    return (
      <div className="mx-auto w-full max-w-[1600px] px-8 py-10 lg:px-12">
        <p className="text-sm text-[var(--rd-text-muted)]">
          That book doesn&apos;t exist anymore.{" "}
          <Link href="/reading/admin/books" className="font-medium text-[var(--rd-text)] hover:underline">
            Back to books
          </Link>
        </p>
      </div>
    );
  }

  return <BookForm key={book.id} initialBook={book} />;
}
