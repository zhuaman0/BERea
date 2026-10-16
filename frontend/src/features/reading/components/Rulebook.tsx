"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Flame, HeartHandshake, Sparkles, TrendingUp, Trophy, type LucideIcon } from "lucide-react";
import { ENTRY_FEE, SEASON_FACTS, SEASON_GOALS, SEASON_RULES } from "@/features/reading/lib/seasonRules";

const GOAL_ICONS: readonly LucideIcon[] = [Flame, TrendingUp, HeartHandshake];

const EASE = [0.16, 1, 0.3, 1] as const;

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay, ease: EASE },
  };
}

function revealOnScroll(delay = 0) {
  return {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: { duration: 0.55, delay, ease: EASE },
  };
}

interface SectionHeadingProps {
  eyebrow: string;
  title:   string;
}

function SectionHeading({ eyebrow, title }: SectionHeadingProps) {
  return (
    <motion.div {...revealOnScroll()} className="mb-6">
      <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-[var(--rd-accent-from)]">{eyebrow}</p>
      <h2 className="font-display mt-2 text-2xl font-semibold text-[var(--rd-text)] sm:text-[28px]">{title}</h2>
    </motion.div>
  );
}

/** The full season rulebook, shared by the in-app Rules page and the public landing page. */
export function Rulebook() {
  const t = useTranslations("reading.rulebook");

  return (
    <>
      {/* ── Season at a glance ───────────────────────────────────────────── */}
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {SEASON_FACTS.map((fact, i) => (
          <motion.div
            key={fact.id}
            {...fadeUp(0.1 + i * 0.06)}
            className="rounded-2xl border border-[var(--rd-border)] bg-[var(--rd-panel)] px-5 py-5"
          >
            <p className="font-display bg-gradient-to-br from-[var(--rd-accent-from)] to-[var(--rd-accent-to)] bg-clip-text text-4xl font-bold leading-none text-transparent">
              {fact.value}
            </p>
            <p className="mt-2 text-[12px] font-medium uppercase tracking-[0.15em] text-[var(--rd-text-muted)]">
              {t(`facts.${fact.id}`, { count: fact.value })}
            </p>
          </motion.div>
        ))}
      </div>

      {/* ── Why 451° ─────────────────────────────────────────────────────── */}
      <section className="mt-16">
        <SectionHeading eyebrow={t("why.eyebrow")} title={t("why.title")} />
        <motion.div
          {...revealOnScroll(0.05)}
          className="grid grid-cols-1 items-center gap-8 rounded-[28px] border border-[var(--rd-border)] bg-[var(--rd-panel)] p-6 sm:grid-cols-[auto_1fr] sm:p-10"
        >
          <div className="relative mx-auto w-36 shrink-0 -rotate-3 transition-transform duration-500 hover:rotate-0 sm:w-40">
            <Image
              src="/fahrenheit-451-cover.png"
              alt={t("why.coverAlt")}
              width={527}
              height={828}
              className="h-auto w-full rounded-r-lg rounded-l-sm shadow-[0_30px_60px_-20px_rgba(255,107,44,0.55)]"
            />
            <span className="pointer-events-none absolute inset-y-0 left-0 w-2 rounded-l-sm bg-black/30" aria-hidden="true" />
          </div>

          <div>
            <p className="font-display text-lg font-semibold text-[var(--rd-text)] sm:text-xl">
              {t.rich("why.lead", { em: (chunks) => <em>{chunks}</em> })}
            </p>
            <p className="mt-3 text-[14px] leading-relaxed text-[var(--rd-text-muted)]">
              {t("why.body")}
            </p>
          </div>
        </motion.div>
      </section>

      {/* ── Goals ────────────────────────────────────────────────────────── */}
      <section className="mt-16">
        <SectionHeading eyebrow={t("goals.eyebrow")} title={t("goals.title")} />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {SEASON_GOALS.map((goal, i) => {
            const Icon = GOAL_ICONS[i] ?? Sparkles;
            return (
              <motion.div
                key={goal}
                {...revealOnScroll(i * 0.08)}
                className="group rounded-2xl border border-[var(--rd-border)] bg-[var(--rd-panel)] p-6 transition-colors duration-300 hover:border-[var(--rd-accent-from)]/40"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--rd-accent-from)]/30 bg-[var(--rd-ink)] text-[var(--rd-accent-from)] transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110">
                  <Icon size={20} />
                </span>
                <p className="mt-5 text-[14px] leading-relaxed text-[var(--rd-text)]">{t(`goals.${goal}`)}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── Rules ────────────────────────────────────────────────────────── */}
      <section className="mt-16">
        <SectionHeading eyebrow={t("howToPlay.eyebrow")} title={t("howToPlay.title")} />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {SEASON_RULES.map(({ id, bodyKey, icon: Icon }, i) => (
            <motion.div
              key={id}
              {...revealOnScroll((i % 2) * 0.08)}
              className="group relative overflow-hidden rounded-2xl border border-[var(--rd-border)] bg-[var(--rd-panel)] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--rd-accent-from)]/50"
            >
              <span
                className="font-display pointer-events-none absolute -right-2 -top-4 select-none text-7xl font-bold leading-none text-white/[0.04] transition-colors duration-300 group-hover:text-[var(--rd-accent-from)]/10"
                aria-hidden="true"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="relative flex items-start gap-4">
                <span className="rd-accent-gradient flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#1a0e05]">
                  <Icon size={18} />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--rd-text-muted)]">
                    {t("howToPlay.ruleNumber", { number: String(i + 1).padStart(2, "0") })}
                  </p>
                  <p className="font-display mt-1 text-[17px] font-semibold text-[var(--rd-text)]">{t(`rules.${id}.title`)}</p>
                  <p className="mt-2 text-[13px] leading-relaxed text-[var(--rd-text-muted)]">
                    {t(`rules.${id}.${bodyKey}`, { fee: ENTRY_FEE })}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Gamification ─────────────────────────────────────────────────── */}
      <motion.section
        {...revealOnScroll()}
        className="mt-16 rounded-[28px] border border-[var(--rd-border)] bg-[var(--rd-ink)] px-6 py-10 text-center sm:px-12"
      >
        <Sparkles size={22} className="mx-auto text-[var(--rd-accent-to)]" />
        <p className="font-display mx-auto mt-4 max-w-2xl text-xl font-semibold leading-snug text-[var(--rd-text)] sm:text-2xl">
          {t("gamification.title")}
        </p>
        <p className="mx-auto mt-3 max-w-xl text-[14px] leading-relaxed text-[var(--rd-text-muted)]">
          {t("gamification.body")}
        </p>
      </motion.section>

      {/* ── Champion ─────────────────────────────────────────────────────── */}
      <motion.section
        {...revealOnScroll()}
        className="relative mt-4 overflow-hidden rounded-[28px] border border-[var(--rd-accent-from)]/40 bg-[var(--rd-panel)] px-6 py-12 text-center sm:px-12"
      >
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-48 w-[480px] max-w-full -translate-x-1/2 rounded-full bg-[var(--rd-accent-from)]/15 blur-[90px]"
          aria-hidden="true"
        />
        <span className="rd-accent-gradient relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl shadow-[0_0_50px_-8px_rgba(255,107,44,0.8)]">
          <Trophy size={28} className="text-[#1a0e05]" />
        </span>
        <h2 className="font-display relative mt-6 text-2xl font-semibold text-[var(--rd-text)] sm:text-3xl">
          {t("champion.title")}
        </h2>
        <p className="relative mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-[var(--rd-text-muted)]">
          {t("champion.body")}
        </p>
        <p className="font-display relative mt-6 bg-gradient-to-r from-[var(--rd-accent-from)] to-[var(--rd-accent-to)] bg-clip-text text-lg font-bold text-transparent">
          {t("champion.motto")}
        </p>
      </motion.section>

      <p className="mt-8 text-center text-[11px] text-[var(--rd-text-muted)]">
        {t("copyright")}
      </p>
    </>
  );
}
