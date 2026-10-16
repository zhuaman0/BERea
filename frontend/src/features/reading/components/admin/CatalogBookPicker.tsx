"use client";

import Link from "next/link";
import { Check, ImageIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { bookCoverSrc } from "@berea/api";
import type { ReadingBook } from "@berea/api";

function matches(value: string | null, winner: string | null): boolean {
  return !winner || value?.trim().toLowerCase() === winner.trim().toLowerCase();
}

interface CatalogBookPickerProps {
  books:          ReadingBook[];
  languageWinner: string | null;
  genreWinner:    string | null;
  selectedIds:    string[];
  onToggle:       (id: string) => void;
}

export function CatalogBookPicker({
  books,
  languageWinner,
  genreWinner,
  selectedIds,
  onToggle,
}: CatalogBookPickerProps) {
  const visible = books.filter((b) => matches(b.language, languageWinner) && matches(b.genre, genreWinner));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-xs font-medium uppercase tracking-wide text-[var(--rd-text-muted)]">
          Books from the catalog · {selectedIds.length} selected
        </label>
        <span className="text-xs text-[var(--rd-text-muted)]">{[languageWinner, genreWinner].filter(Boolean).join(" · ")} · Up to 12 books</span>
      </div>

      {books.length === 0 ? (
        <p className="rounded-lg border border-dashed border-[var(--rd-border)] p-4 text-[13px] text-[var(--rd-text-muted)]">
          The catalog is empty.{" "}
          <Link href="/reading/admin/books/new" className="font-medium text-[var(--rd-text)] hover:underline">
            Add books
          </Link>{" "}
          first, with their language and genre.
        </p>
      ) : visible.length === 0 ? (
        <p className="rounded-lg border border-dashed border-[var(--rd-border)] p-4 text-[13px] text-[var(--rd-text-muted)]">
          No catalog books match the winning language and genre.{" "}
          <Link href="/reading/admin/books/new" className="underline">Add matching books</Link> to continue.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {visible.map((book) => {
            const isSelected = selectedIds.includes(book.id);
            const cover = bookCoverSrc(book.cover_url);
            return (
              <button
                key={book.id}
                type="button"
                role="checkbox"
                aria-checked={isSelected}
                onClick={() => onToggle(book.id)}
                disabled={!isSelected && selectedIds.length >= 12}
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-2.5 text-left transition-colors disabled:opacity-40",
                  isSelected
                    ? "border-[var(--rd-accent-from)] bg-[var(--rd-accent-from)]/[0.06]"
                    : "border-[var(--rd-border)] hover:border-[var(--rd-accent-from)]/50"
                )}
              >
                <span className="flex h-14 w-10 shrink-0 items-center justify-center overflow-hidden rounded bg-[var(--rd-ink)]">
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element -- admin-supplied cover from our API or an external URL
                    <img src={cover} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <ImageIcon size={14} className="text-[var(--rd-text-muted)]" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium text-[var(--rd-text)]">{book.title}</span>
                  <span className="block truncate text-[11px] text-[var(--rd-text-muted)]">
                    {[book.language, book.genre, book.page_count ? `${book.page_count} pages` : null]
                      .filter(Boolean)
                      .join(" · ") || "No details yet"}
                  </span>
                </span>
                <span
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                    isSelected ? "border-transparent bg-[var(--rd-accent-from)] text-black/80" : "border-[var(--rd-border)]"
                  )}
                >
                  {isSelected && <Check size={12} strokeWidth={3} />}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
