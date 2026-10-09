"use client";

import Link from "next/link";
import type { Route } from "next";
import { ImageIcon, Pencil, Plus, Trash2 } from "lucide-react";
import { useReadingBookStore } from "@/features/reading/store/useReadingBookStore";
import type { AdminBook } from "@/features/reading/bookTypes";

function BookCard({ book, onDelete }: { book: AdminBook; onDelete: (id: string) => void }) {
  return (
    <div className="group relative flex w-56 shrink-0 flex-col gap-3 rounded-2xl border border-[var(--rd-border)] bg-[var(--rd-panel)] p-4">
      <div className="flex h-40 items-center justify-center overflow-hidden rounded-xl bg-[var(--rd-ink)]">
        {book.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- arbitrary admin-supplied cover (data URL or external URL)
          <img src={book.coverUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <ImageIcon size={24} className="text-[var(--rd-text-muted)]" />
        )}
      </div>
      <div>
        <p className="font-display truncate text-sm font-semibold text-[var(--rd-text)]">{book.title}</p>
        <p className="mt-1 line-clamp-2 text-xs text-[var(--rd-text-muted)]">
          {book.description || "No description yet."}
        </p>
      </div>

      <div className="absolute right-3 top-3 hidden items-center gap-1 group-hover:flex">
        <Link
          href={`/reading/admin/books/${book.id}` as Route}
          aria-label="Edit book"
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--rd-border)] bg-[var(--rd-ink)] text-[var(--rd-text-muted)] transition-colors hover:text-[var(--rd-text)]"
        >
          <Pencil size={13} />
        </Link>
        <button
          onClick={() => onDelete(book.id)}
          aria-label="Delete book"
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--rd-border)] bg-[var(--rd-ink)] text-[var(--rd-text-muted)] transition-colors hover:text-red-400"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

export default function ReadingAdminBooksPage() {
  const books = useReadingBookStore((s) => s.books);
  const deleteBook = useReadingBookStore((s) => s.deleteBook);

  return (
    <div className="mx-auto w-full max-w-[1600px] px-8 py-10 lg:px-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[var(--rd-text)]">Books</h1>
          <p className="mt-1 text-sm text-[var(--rd-text-muted)]">
            Add the book of the month, with a cover and description.
          </p>
        </div>
        <Link
          href={"/reading/admin/books/new" as Route}
          className="rd-accent-gradient inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-black/85 transition-opacity hover:opacity-90"
        >
          <Plus size={15} />
          Add a book
        </Link>
      </div>

      {books.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-[var(--rd-border)] p-10 text-center">
          <p className="text-sm text-[var(--rd-text-muted)]">No books yet — add one to get started.</p>
        </div>
      ) : (
        <div className="mt-8 flex flex-wrap gap-5">
          {books.map((book) => (
            <BookCard key={book.id} book={book} onDelete={deleteBook} />
          ))}
        </div>
      )}
    </div>
  );
}
