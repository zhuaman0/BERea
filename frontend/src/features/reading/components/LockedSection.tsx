"use client";

import Link from "next/link";
import type { Route } from "next";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ArrowRight, BookOpen, Lock, Users } from "lucide-react";

type SectionKey = "leaderboard" | "profile" | "quiz" | "fallback";

const SECTION_KEYS: Record<string, SectionKey> = {
  "/reading/leaderboard": "leaderboard",
  "/reading/profile":     "profile",
  "/reading/quiz":        "quiz",
};

const EASE = [0.16, 1, 0.3, 1] as const;

interface LockedSectionProps {
  pathname: string;
}

export function LockedSection({ pathname }: LockedSectionProps) {
  const t = useTranslations("reading.locked");
  const section = SECTION_KEYS[pathname] ?? "fallback";

  return (
    <div className="relative flex min-h-full items-center justify-center overflow-hidden px-6 py-16">
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--rd-accent-from)]/10 blur-[110px]"
        aria-hidden="true"
      />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="relative flex max-w-md flex-col items-center text-center"
      >
        <div className="relative">
          <motion.span
            className="absolute inset-0 rounded-[28px] border border-[var(--rd-accent-from)]/40"
            animate={{ scale: [1, 1.35], opacity: [0.6, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
            aria-hidden="true"
          />
          <span className="relative flex h-20 w-20 items-center justify-center rounded-[28px] border border-[var(--rd-border)] bg-[var(--rd-panel)] shadow-[0_24px_60px_-20px_rgba(255,107,44,0.55)]">
            <Lock size={30} strokeWidth={1.75} className="text-[var(--rd-accent-from)]" />
          </span>
        </div>

        <span className="mt-8 inline-flex items-center gap-2 rounded-full border border-[var(--rd-border)] bg-[var(--rd-panel)] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--rd-text-muted)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--rd-accent-from)]" />
          {t("badge")}
        </span>

        <h1 className="font-display mt-4 text-3xl font-semibold leading-tight text-[var(--rd-text)] sm:text-4xl">
          {t(`sections.${section}.title`)}
        </h1>
        <p className="mt-3 text-[14px] leading-relaxed text-[var(--rd-text-muted)]">{t(`sections.${section}.body`)}</p>

        <div className="mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Link
            href={"/reading/team" as Route}
            className="rd-accent-gradient inline-flex h-11 items-center justify-center gap-2 rounded-xl px-6 text-[13px] font-semibold text-[#1a0e05] transition-opacity hover:opacity-90"
          >
            <Users size={15} />
            {t("goToTeam")}
            <ArrowRight size={15} />
          </Link>
          <Link
            href={"/reading/rules" as Route}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[var(--rd-border)] px-6 text-[13px] font-semibold text-[var(--rd-text)] transition-colors hover:border-white/25 hover:bg-white/[0.04]"
          >
            <BookOpen size={15} />
            {t("readRules")}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
