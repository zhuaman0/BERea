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
  onlyMatching:   boolean;
  onOnlyMatchingChange: (value: boolean) => void;
  selectedIds:    string[];
  onToggle:       (id: string) => void;
}

/** Book-round options come from the catalog, narrowed to the winning language and genre by default. */
export function CatalogBookPicker({
  books,
  languageWinner,
  genreWinner,
  onlyMatching,
  onOnlyMatchingChange,
  selectedIds,
  onToggle,
}: CatalogBookPickerProps) {
  const hasWinners = Boolean(languageWinner || genreWinner);
  const visible = onlyMatching
    ? books.filter((b) => matches(b.language, languageWinner) && matches(b.genre, genreWinner))
    : books;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-xs font-medium uppercase tracking-wide text-[var(--rd-text-muted)]">
          Books from the catalog · {selectedIds.length} selected
        </label>
        {hasWinners && (
          <label className="inline-flex cursor-pointer items-center gap-2 text-[12px] text-[var(--rd-text-muted)]">
            <input
              type="checkbox"
              checked={onlyMatching}
              onChange={(e) => onOnlyMatchingChange(e.target.checked)}
              className="accent-[var(--rd-accent-from)]"
            />
            Only {[languageWinner, genreWinner].filter(Boolean).join(" · ")} books
          </label>
        )}
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
          No catalog books match the winning language and genre. Untick the filter or add matching books.
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
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-2.5 text-left transition-colors",
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
