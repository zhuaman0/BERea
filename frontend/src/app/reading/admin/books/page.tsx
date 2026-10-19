"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { useTranslations } from "next-intl";
import { ImageIcon, Library, Pencil, Plus, Trash2 } from "lucide-react";
import { isApiError } from "@/features/auth/utils";
import { bookCoverSrc, readingBookApi } from "@berea/api";
import type { ReadingBook } from "@berea/api";
import { ReadingPageHero } from "@/features/reading/components/layout/ReadingPageHero";
import { READING_PAGE_CONTAINER } from "@/features/reading/lib/pageContainer";

interface BookCardProps {
  book:     ReadingBook;
  onDelete: (book: ReadingBook) => void;
}

function BookCard({ book, onDelete }: BookCardProps) {
  const coverSrc = bookCoverSrc(book.cover_url);
  const t = useTranslations("reading.admin.books");
  return (
    <div className="group relative flex w-56 shrink-0 flex-col gap-3 rounded-2xl border border-[var(--rd-border)] bg-[var(--rd-panel)] p-4">
      <div className="flex h-40 items-center justify-center overflow-hidden rounded-xl bg-[var(--rd-ink)]">
        {coverSrc ? (
          // eslint-disable-next-line @next/next/no-img-element -- admin-supplied cover from our API or an external URL
          <img src={coverSrc} alt="" className="h-full w-full object-cover" />
        ) : (
          <ImageIcon size={24} className="text-[var(--rd-text-muted)]" />
        )}
      </div>
      <div>
        <p className="font-display truncate text-sm font-semibold text-[var(--rd-text)]">{book.title}</p>
        <p className="mt-1 line-clamp-2 text-xs text-[var(--rd-text-muted)]">
          {book.description || t("noDescription")}
        </p>
      </div>

      <div className="absolute right-3 top-3 hidden items-center gap-1 group-hover:flex">
        <Link
          href={`/reading/admin/books/${book.id}` as Route}
          aria-label={t("edit")}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--rd-border)] bg-[var(--rd-ink)] text-[var(--rd-text-muted)] transition-colors hover:text-[var(--rd-text)]"
        >
          <Pencil size={13} />
        </Link>
        <button
          onClick={() => onDelete(book)}
          aria-label={t("delete")}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--rd-border)] bg-[var(--rd-ink)] text-[var(--rd-text-muted)] transition-colors hover:text-red-400"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

export default function ReadingAdminBooksPage() {
  const [books, setBooks] = useState<ReadingBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations("reading.admin.books");
  const tCommon = useTranslations("reading.admin.common");

  useEffect(() => {
    readingBookApi
      .list()
      .then(setBooks)
      .catch((err) => setError(isApiError(err) ? err.detail : t("loadError")))
      .finally(() => setIsLoading(false));
  }, [t]);

  async function handleDelete(book: ReadingBook) {
    if (!window.confirm(t("deleteConfirm", { title: book.title }))) return;
    try {
      await readingBookApi.remove(book.id);
      setBooks((prev) => prev.filter((b) => b.id !== book.id));
    } catch (err) {
      setError(isApiError(err) ? err.detail : t("deleteError"));
    }
  }

  return (
    <div className={READING_PAGE_CONTAINER}>
      <ReadingPageHero
        eyebrow={tCommon("eyebrow")}
        eyebrowIcon={Library}
        title={t("title")}
        description={t("description")}
        aside={
            <Link
              href={"/reading/admin/books/new" as Route}
              className="rd-accent-gradient inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-black/85 transition-opacity hover:opacity-90"
            >
              <Plus size={15} />
              {t("add")}
            </Link>
        }
      />

      {error && (
        <p role="alert" className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
          {error}
        </p>
      )}

      {isLoading ? (
        <div className="mt-8 flex flex-wrap gap-5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-64 w-56 animate-pulse rounded-2xl border border-[var(--rd-border)] bg-[var(--rd-panel)]" />
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-[var(--rd-border)] p-10 text-center">
          <p className="text-sm text-[var(--rd-text-muted)]">{t("empty")}</p>
        </div>
      ) : (
        <div className="mt-8 flex flex-wrap gap-5">
          {books.map((book) => (
            <BookCard key={book.id} book={book} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
