"use client";

import { useCallback, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Route } from "next";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ArrowRight, Loader2, Radio, X } from "lucide-react";
import { readingLiveQuizApi, type LiveSummary } from "@berea/api";
import { usePolling } from "@berea/core";
import { isApiError } from "@/features/auth/utils";
import {
  dismissInvite,
  parseJoinedSession,
  readDismissedInvite,
  readJoinedSession,
  saveJoinedSession,
} from "../../lib/liveQuizSession";

const LIVE_CHECK_INTERVAL_MS = 5000;
const QUIZ_PATH = "/reading/quiz";

/**
 * Brings students into a running quiz from any page: a popup the moment it goes live, and a
 * banner that stays after the popup is closed. Both join with the PIN already filled in.
 */
export function LiveQuizBanner() {
  const t = useTranslations("reading.shell.liveQuiz");
  const pathname = usePathname();
  const router = useRouter();
  const load = useCallback(() => readingLiveQuizApi.live(), []);
  const { data: live } = usePolling(load, LIVE_CHECK_INTERVAL_MS);
  const [closedId, setClosedId] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLive = live !== null && live.phase !== "finished";
  // Read only once a live quiz has loaded (after hydration), so server and client agree.
  const alreadyJoined = isLive && parseJoinedSession(readJoinedSession())?.id === live.id;
  const inviteClosed = isLive && (closedId === live.id || readDismissedInvite() === live.id);
  const onQuizPage = pathname === QUIZ_PATH;
  const showBanner = isLive && !onQuizPage;
  const showInvite = isLive && !onQuizPage && !alreadyJoined && !inviteClosed;

  async function join(session: LiveSummary) {
    if (alreadyJoined) {
      router.push(QUIZ_PATH as Route);
      return;
    }
    setIsJoining(true);
    setError(null);
    try {
      const joined = await readingLiveQuizApi.join(session.pin);
      saveJoinedSession({ id: joined.id, format: joined.format });
      router.push(QUIZ_PATH as Route);
    } catch (err) {
      setError(isApiError(err) ? err.detail : t("joinError"));
    } finally {
      setIsJoining(false);
    }
  }

  function closeInvite(sessionId: string) {
    dismissInvite(sessionId);
    setClosedId(sessionId);
  }

  return (
    <>
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <button
              type="button"
              onClick={() => void join(live)}
              disabled={isJoining}
              className="rd-accent-gradient flex w-full items-center justify-center gap-3 px-4 py-2.5 text-sm font-semibold text-black/85"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-black/50" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-black/70" />
              </span>
              <Radio size={15} />
              {alreadyJoined ? t("backToGame", { title: live.quiz_title }) : t("banner", { title: live.quiz_title })}
              <span className="rounded-full bg-black/15 px-2 py-0.5 font-mono tracking-widest">{t("pin", { pin: live.pin })}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showInvite && (
          <motion.div
            key={live.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => closeInvite(live.id)}
            onKeyDown={(e) => { if (e.key === "Escape") closeInvite(live.id); }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="live-invite-title"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.9, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-white/[0.08] bg-[var(--rd-panel)] p-7 text-center shadow-[0_24px_80px_rgba(0,0,0,0.5)]"
            >
              <div className="rd-hero-glow pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
              <button
                type="button"
                onClick={() => closeInvite(live.id)}
                aria-label={t("invite.later")}
                className="absolute right-4 top-4 text-[var(--rd-text-muted)] transition-colors hover:text-[var(--rd-text)]"
              >
                <X size={18} />
              </button>

              <div className="relative">
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--rd-accent-from)]/15">
                  <span className="relative flex h-full w-full items-center justify-center">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--rd-accent-from)]/25" />
                    <Radio size={28} className="relative text-[var(--rd-accent-from)]" />
                  </span>
                </span>
                <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--rd-accent-to)]">{t("invite.eyebrow")}</p>
                <h2 id="live-invite-title" className="font-display mt-2 text-3xl font-semibold leading-tight text-[var(--rd-text)]">
                  {live.quiz_title}
                </h2>
                <p className="mt-2 text-sm text-[var(--rd-text-muted)]">{t("invite.body")}</p>

                <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--rd-text-muted)]">{t("invite.pinLabel")}</p>
                <p className="font-display mt-1 text-4xl font-bold tracking-[0.3em] text-[var(--rd-text)]">{live.pin}</p>

                {error && <p role="alert" className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>}

                <button
                  type="button"
                  onClick={() => void join(live)}
                  disabled={isJoining}
                  autoFocus
                  className="rd-accent-gradient mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl text-base font-semibold text-black/85 transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {isJoining ? <Loader2 size={17} className="animate-spin" /> : <ArrowRight size={17} />}
                  {isJoining ? t("invite.joining") : t("invite.join")}
                </button>
                <button
                  type="button"
                  onClick={() => closeInvite(live.id)}
                  className="mt-3 text-sm text-[var(--rd-text-muted)] transition-colors hover:text-[var(--rd-text)]"
                >
                  {t("invite.later")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
