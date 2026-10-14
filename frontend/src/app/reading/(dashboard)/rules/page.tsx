"use client";

import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { Rulebook } from "@/features/reading/components/Rulebook";
import { READING_PAGE_CONTAINER } from "@/features/reading/lib/pageContainer";

const EASE = [0.16, 1, 0.3, 1] as const;

export default function ReadingRulesPage() {
  return (
    <div className={READING_PAGE_CONTAINER}>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="relative overflow-hidden rounded-[32px] border border-[var(--rd-border)] bg-[var(--rd-panel)] px-6 py-12 sm:px-12 sm:py-16"
      >
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[var(--rd-accent-from)]/20 blur-[100px]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-[var(--rd-accent-to)]/10 blur-[100px]"
          aria-hidden="true"
        />
        <span
          className="font-display pointer-events-none absolute -bottom-10 -right-4 select-none text-[150px] font-bold leading-none text-white/[0.04] sm:text-[220px]"
          aria-hidden="true"
        >
          451°
        </span>

        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--rd-accent-from)]/30 bg-[var(--rd-accent-from)]/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--rd-accent-from)]">
            <Flame size={12} />
            The 451° rulebook
          </span>
          <h1 className="font-display mt-5 text-4xl font-semibold leading-[1.05] text-[var(--rd-text)] sm:text-5xl">
            Read together.{" "}
            <span className="bg-gradient-to-r from-[var(--rd-accent-from)] to-[var(--rd-accent-to)] bg-clip-text text-transparent">
              Win the semester.
            </span>
          </h1>
          <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-[var(--rd-text-muted)]">
            451° is a game where teams of students compete by reading books — one book a month,
            one semester, one champion.
          </p>
        </div>
      </motion.section>

      <Rulebook />
    </div>
  );
}
