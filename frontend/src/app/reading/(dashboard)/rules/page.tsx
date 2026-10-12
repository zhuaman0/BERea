"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { SemesterMapCard } from "@/features/reading/components/SemesterMapCard";
import { BonusTasksCard } from "@/features/reading/components/BonusTasksCard";
import { MOCK_DASHBOARD } from "@/features/reading/mockData";
import { readingSemesterApi } from "@berea/api";
import type { SemesterRound } from "@berea/api";

const RULES = [
  {
    title: "Teams",
    body: "Form a team of 2–3 students before the season starts. Every point your teammates earn from quizzes and reading counts toward your team's total.",
  },
  {
    title: "One book a month",
    body: "Each month the community votes on next month's book from four nominated titles. The winner becomes the required reading for everyone.",
  },
  {
    title: "Quiz night",
    body: "At the end of each month, all teams gather for a live Kahoot-style quiz on that month's book. Quiz points are added straight to your team's score.",
  },
  {
    title: "Bonus tasks",
    body: "Throughout the month you can pick up bonus challenges — short TikTok reviews, quote cards, bringing a new player — each worth extra points.",
  },
  {
    title: "The season",
    body: "The competition runs for 4 months. At the end, the top team wins a semester scholarship or internship placement.",
  },
];

const EASE = [0.16, 1, 0.3, 1] as const;

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.55, delay, ease: EASE },
  };
}

export default function ReadingRulesPage() {
  const dashboard = MOCK_DASHBOARD;

  const [rounds, setRounds] = useState<SemesterRound[]>([]);

  useEffect(() => {
    readingSemesterApi.listRounds().then(setRounds).catch(() => { /* leave empty — card shows its own fallback */ });
  }, []);

  return (
    <div className="max-w-4xl px-6 py-10 md:px-8">
      <motion.div {...fadeUp(0)}>
        <h1 className="font-display text-2xl font-semibold text-[var(--rd-text)]">Rules</h1>
        <p className="mt-1 text-[13px] text-[var(--rd-text-muted)]">How the semester league works, start to finish.</p>
      </motion.div>

      <motion.p
        {...fadeUp(0.08)}
        className="mt-8 text-xs font-medium uppercase tracking-[0.15em] text-[var(--rd-text-muted)]"
      >
        Your progress
      </motion.p>
      <motion.div {...fadeUp(0.14)} className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
        <SemesterMapCard rounds={rounds} />
        <BonusTasksCard tasks={dashboard.bonusTasks} />
      </motion.div>

      <motion.p
        {...fadeUp(0.2)}
        className="mt-10 text-xs font-medium uppercase tracking-[0.15em] text-[var(--rd-text-muted)]"
      >
        How it works
      </motion.p>

      <div className="mt-1 flex flex-col border-t border-[var(--rd-border)]">
        {RULES.map((rule, i) => (
          <motion.div
            key={rule.title}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
            className="group flex items-start gap-5 border-b border-[var(--rd-border)] py-7 sm:gap-8"
          >
            <motion.span
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: i * 0.05 + 0.08, ease: EASE }}
              className="font-display relative block w-14 shrink-0 text-5xl font-bold leading-none sm:w-20 sm:text-6xl"
            >
              <span className="block text-[var(--rd-text-muted)] transition-opacity duration-500 group-hover:opacity-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                className="absolute inset-0 bg-gradient-to-r from-[var(--rd-accent-from)] to-[var(--rd-accent-to)] bg-clip-text text-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                aria-hidden="true"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
            </motion.span>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: i * 0.05 + 0.14, ease: EASE }}
              className="min-w-0 pt-1 transition-transform duration-300 ease-out group-hover:translate-x-1.5"
            >
              <p className="font-display text-base font-semibold text-[var(--rd-text)] sm:text-lg">{rule.title}</p>
              <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-[var(--rd-text-muted)] sm:text-sm">
                {rule.body}
              </p>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
