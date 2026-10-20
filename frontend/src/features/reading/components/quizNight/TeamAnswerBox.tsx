"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import { readingQuizNightApi, type NightState } from "@berea/api";
import { isApiError } from "@/features/auth/utils";
import { cn } from "@/shared/lib/utils";

const SAVE_DEBOUNCE_MS = 400;
// After the last keystroke, keep the local text this long before taking teammates' edits again.
const IDLE_BEFORE_SYNC_MS = 1500;
const SAVED_BADGE_MS = 1200;
const MAX_LENGTH = 300;

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface TeamAnswerBoxProps {
  sessionId:  string;
  questionId: string;
  /** The team's current text from the server (a teammate may be typing too). */
  serverText: string;
  locked:     boolean;
  onSaved:    (state: NightState) => void;
}

/** One shared answer per team: anyone on the team can type, and the latest save wins (A9). */
export function TeamAnswerBox({ sessionId, questionId, serverText, locked, onSaved }: TeamAnswerBoxProps) {
  const t = useTranslations("reading.night.answerBox");
  const [draft, setDraft] = useState<string | null>(null);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const saveTimer = useRef<number | null>(null);
  const idleTimer = useRef<number | null>(null);
  const badgeTimer = useRef<number | null>(null);

  useEffect(() => () => {
    for (const timer of [saveTimer, idleTimer, badgeTimer]) {
      if (timer.current !== null) window.clearTimeout(timer.current);
    }
  }, []);

  function save(text: string) {
    setStatus("saving");
    readingQuizNightApi
      .saveAnswer(sessionId, questionId, text)
      .then((state) => {
        onSaved(state);
        setStatus("saved");
        setError(null);
        if (badgeTimer.current !== null) window.clearTimeout(badgeTimer.current);
        badgeTimer.current = window.setTimeout(() => setStatus("idle"), SAVED_BADGE_MS);
      })
      .catch((err: unknown) => {
        setStatus("error");
        setError(isApiError(err) ? err.detail : t("saveError"));
      });
  }

  function handleChange(text: string) {
    setDraft(text);
    if (saveTimer.current !== null) window.clearTimeout(saveTimer.current);
    if (idleTimer.current !== null) window.clearTimeout(idleTimer.current);
    saveTimer.current = window.setTimeout(() => save(text), SAVE_DEBOUNCE_MS);
    idleTimer.current = window.setTimeout(() => setDraft(null), IDLE_BEFORE_SYNC_MS);
  }

  const value = draft ?? serverText;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={locked ? { opacity: 1, y: 0, x: [0, -4, 4, -2, 2, 0] } : { opacity: 1, y: 0 }}
      transition={locked ? { duration: 0.35 } : { delay: 0.45, duration: 0.35 }}
      className="w-full max-w-2xl"
    >
      <label htmlFor="team-answer" className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--rd-text-muted)]">
        {t("label")}
      </label>
      <div
        className={cn(
          "relative mt-2 rounded-2xl border-2 bg-[var(--rd-panel)] transition-colors",
          locked ? "border-[var(--rd-border)]" : "border-white/25 focus-within:border-white",
        )}
      >
        <textarea
          id="team-answer"
          value={value}
          onChange={(e) => handleChange(e.target.value.slice(0, MAX_LENGTH))}
          readOnly={locked}
          rows={2}
          maxLength={MAX_LENGTH}
          placeholder={locked ? t("noAnswer") : t("placeholder")}
          className={cn(
            "w-full resize-none rounded-2xl bg-transparent px-4 py-3 pr-12 text-lg text-[var(--rd-text)] placeholder:text-[var(--rd-text-muted)] focus:outline-none",
            locked && "opacity-60",
          )}
        />
        <AnimatePresence>
          {locked && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 18 }}
              className="absolute right-3 top-3 text-[var(--rd-text-muted)]"
            >
              <Lock size={20} aria-label={t("locked")} />
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <div className="mt-2 flex h-5 items-center gap-1.5 text-xs" aria-live="polite">
        {locked ? (
          <span className="text-[var(--rd-text-muted)]">{t("locked")}</span>
        ) : status === "saving" ? (
          <span className="flex items-center gap-1.5 text-[var(--rd-text-muted)]"><Loader2 size={12} className="animate-spin" /> {t("saving")}</span>
        ) : status === "saved" ? (
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1.5 text-emerald-400">
            <Check size={13} /> {t("saved")}
          </motion.span>
        ) : status === "error" ? (
          <span className="text-red-400">{error}</span>
        ) : (
          <span className="text-[var(--rd-text-muted)]">{t("hint")}</span>
        )}
      </div>
    </motion.div>
  );
}
