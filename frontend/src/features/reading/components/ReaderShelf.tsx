"use client";

import Link from "next/link";
import type { Route } from "next";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { cn } from "@/shared/lib/utils";
import type { ReadingShelfEntry } from "@berea/api";

const EASE = [0.16, 1, 0.3, 1] as const;

function percentRead(entry: ReadingShelfEntry): number {
  const total = entry.book.page_count;
  if (!total) return 0;
  return Math.round((Math.min(entry.current_page, total) / total) * 100);
}

/** Thicker books get wider spines, so the shelf reads like a real one. */
function spineWidth(pageCount: number | null): number {
  const pages = Math.min(Math.max(pageCount ?? 300, 120), 800);
  return Math.round(30 + ((pages - 120) / 680) * 34);
}

interface ReaderShelfProps {
  shelf: ReadingShelfEntry[];
}

export function ReaderShelf({ shelf }: ReaderShelfProps) {
  const t = useTranslations("reading.shelf");
  const reduceMotion = useReducedMotion();
  const reading = shelf.find((entry) => percentRead(entry) < 100) ?? null;

  if (shelf.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--rd-border)] px-6 py-10 text-center">
        <p className="text-sm text-[var(--rd-text)]">{t("emptyTitle")}</p>
        <p className="mt-1 text-[13px] text-[var(--rd-text-muted)]">
          {t("emptyBody")}
        </p>
        <Link
          href={"/reading" as Route}
          className="mt-5 inline-flex h-10 items-center rounded-lg border border-[var(--rd-border)] px-4 text-[13px] font-medium text-[var(--rd-text)] transition-colors hover:border-[var(--rd-accent-from)] hover:text-[var(--rd-accent-from)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rd-accent-from)]"
        >
          {t("logPages")}
        </Link>
      </div>
    );
  }

  return (
    <div>
      <ul className="rd-scroll-x flex items-end gap-1.5 overflow-x-auto px-1 pt-2">
        {shelf.map((entry, i) => {
          const percent = percentRead(entry);
          const finished = percent === 100;
          const pages = entry.book.page_count;
          const label = pages
            ? t(finished ? "spineFinished" : "spineOf", { title: entry.book.title, page: entry.current_page, total: pages })
            : t("spine", { title: entry.book.title, page: entry.current_page });

          return (
            <li
              key={entry.book.id}
              tabIndex={0}
              title={label}
              aria-label={label}
              className={cn(
                "relative h-44 shrink-0 overflow-hidden rounded-t-[3px] bg-[#1d1613] shadow-[inset_-3px_0_0_rgba(0,0,0,0.35)] outline-none transition-transform duration-300 ease-out hover:-translate-y-1.5 focus-visible:-translate-y-1.5 focus-visible:ring-2 focus-visible:ring-[var(--rd-accent-from)]",
                finished && "border-t-2 border-emerald-400"
              )}
              style={{ width: spineWidth(pages) }}
            >
              <motion.div
                aria-hidden="true"
                initial={reduceMotion ? false : { scaleY: 0 }}
                animate={{ scaleY: percent / 100 }}
                transition={{ duration: 1.1, delay: 0.2 + i * 0.07, ease: EASE }}
                className="absolute inset-0 origin-bottom bg-gradient-to-t from-[var(--rd-accent-from)] to-[var(--rd-accent-to)]"
              />
              <span
                aria-hidden="true"
                className="absolute inset-0 flex items-center justify-center overflow-hidden py-3 font-display text-[12px] font-semibold text-[var(--rd-text)] [text-shadow:0_1px_2px_rgba(0,0,0,0.6)] [writing-mode:vertical-rl] rotate-180 whitespace-nowrap"
              >
                {entry.book.title}
              </span>
            </li>
          );
        })}
      </ul>
      <div className="h-2 rounded-sm bg-gradient-to-b from-[#3a2a20] to-[#1d1613]" aria-hidden="true" />

      <p className="mt-5 text-[13px] text-[var(--rd-text-muted)]">
        {reading ? (
          reading.book.page_count
            ? t.rich("readingNowOf", {
                title: reading.book.title,
                page: reading.current_page,
                total: reading.book.page_count,
                percent: percentRead(reading),
                book: (chunks) => <span className="text-[var(--rd-text)]">{chunks}</span>,
              })
            : t.rich("readingNow", {
                title: reading.book.title,
                page: reading.current_page,
                book: (chunks) => <span className="text-[var(--rd-text)]">{chunks}</span>,
              })
        ) : (
          t("allFinished")
        )}
      </p>
    </div>
  );
}
