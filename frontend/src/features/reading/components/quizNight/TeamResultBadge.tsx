"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { useTranslations } from "next-intl";
import type { NightYourAnswer } from "@berea/api";
import { cn } from "@/shared/lib/utils";

const AFTER_HIGHLIGHT_S = 1.2;

interface TeamResultBadgeProps {
  answer: NightYourAnswer;
}

/** The player's own verdict, popping in once the highlighter has finished (A14). */
export function TeamResultBadge({ answer }: TeamResultBadgeProps) {
  const t = useTranslations("reading.night.result");
  const correct = answer.grade === "correct";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: AFTER_HIGHLIGHT_S, duration: 0.3 }}
      className="relative flex w-full max-w-2xl items-center gap-4 rounded-2xl border border-[var(--rd-border)] bg-[var(--rd-panel)] px-5 py-4"
    >
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.15, 1] }}
        transition={{ delay: AFTER_HIGHLIGHT_S, duration: 0.4 }}
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
          correct ? "bg-emerald-400/15 text-emerald-400" : "bg-red-500/15 text-red-400",
        )}
      >
        {correct ? <Check size={22} /> : <X size={22} />}
      </motion.span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--rd-text-muted)]">{t("yourAnswer")}</p>
        <p className="truncate text-base text-[var(--rd-text)]">{answer.text || t("noAnswer")}</p>
      </div>
      <span className={cn("font-display ml-auto text-lg font-bold", correct ? "text-emerald-400" : "text-[var(--rd-text-muted)]")}>
        {t("points", { count: answer.points ?? 0 })}
      </span>
      {correct && (
        <motion.span
          aria-hidden="true"
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: [0, 1, 0], y: -24 }}
          transition={{ delay: AFTER_HIGHLIGHT_S + 0.2, duration: 0.8 }}
          className="font-display absolute right-6 top-0 text-sm font-bold text-emerald-400"
        >
          +{answer.points}
        </motion.span>
      )}
    </motion.div>
  );
}
