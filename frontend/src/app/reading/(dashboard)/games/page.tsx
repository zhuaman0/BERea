"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, LayoutGroup, MotionConfig, motion } from "framer-motion";
import { Check, Clock, Globe, Tags, BookOpen } from "lucide-react";
import { VoteOptionCard } from "@/features/reading/components/VoteOptionCard";
import { readingVoteApi } from "@berea/api";
import { isApiError } from "@/features/auth/utils";
import type { VoteRound, VoteStage } from "@berea/api";
import { READING_PAGE_CONTAINER } from "@/features/reading/lib/pageContainer";

const STAGE_META: Record<VoteStage, { label: string; icon: typeof Globe }> = {
  language: { label: "Language", icon: Globe },
  genre:    { label: "Genre",    icon: Tags },
  book:     { label: "Book",     icon: BookOpen },
};

const EASE = [0.16, 1, 0.3, 1] as const;
const VOTE_RIPPLE_MS = 1200;

function VoteSkeleton() {
  return (
    <div className="mt-6 animate-pulse rounded-2xl border border-[var(--rd-border)] bg-[var(--rd-panel)] p-6" aria-label="Loading the vote">
      <div className="h-3 w-28 rounded bg-white/[0.06]" />
      <div className="mt-3 h-6 w-56 rounded bg-white/[0.06]" />
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-36 rounded-xl border border-[var(--rd-border)] bg-white/[0.02]" />
        ))}
      </div>
    </div>
  );
}

function useCountdown(closesAt: string | undefined): string {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!closesAt) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [closesAt]);

  if (!closesAt) return "";
  const diffMs = new Date(closesAt).getTime() - now;
  if (diffMs <= 0) return "Voting closed";

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
  const seconds = Math.floor((diffMs / 1000) % 60);
  return `${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;
}

export default function ReadingGamesPage() {
  const [rounds, setRounds] = useState<VoteRound[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [voteError, setVoteError] = useState<string | null>(null);
  const [pendingOptionId, setPendingOptionId] = useState<string | null>(null);
  const [justVotedId, setJustVotedId] = useState<string | null>(null);

  useEffect(() => {
    readingVoteApi
      .listRounds()
      .then(setRounds)
      .catch((err) => setLoadError(isApiError(err) ? err.detail : "Couldn't load the vote."))
      .finally(() => setIsLoading(false));
  }, []);

  const currentRound = rounds.length > 0 ? rounds[rounds.length - 1] : null;
  const history = rounds.slice(0, -1);
  const countdown = useCountdown(currentRound?.is_open ? currentRound.closes_at : undefined);

  const winningOption = useMemo(() => {
    if (!currentRound || currentRound.is_open) return null;
    return currentRound.options.find((o) => o.id === currentRound.winner_option_id) ?? null;
  }, [currentRound]);

  async function handleVote(optionId: string) {
    if (!currentRound || pendingOptionId) return;
    setVoteError(null);
    setPendingOptionId(optionId);
    try {
      const updated = await readingVoteApi.castVote(currentRound.id, optionId);
      setRounds((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setJustVotedId(optionId);
      window.setTimeout(() => setJustVotedId((id) => (id === optionId ? null : id)), VOTE_RIPPLE_MS);
    } catch (err: unknown) {
      setVoteError(isApiError(err) ? err.detail : "Couldn't cast your vote. Please try again.");
    } finally {
      setPendingOptionId(null);
    }
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className={READING_PAGE_CONTAINER}>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
          <h1 className="font-display text-2xl font-semibold text-[var(--rd-text)]">Choose the book</h1>
          <p className="mt-1 text-[13px] text-[var(--rd-text-muted)]">
            Language, then genre, then the book itself — each round decided by majority vote.
          </p>
        </motion.div>

        {history.length > 0 && (
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {history.map((round, i) => {
              const winner = round.options.find((o) => o.id === round.winner_option_id);
              const Icon = STAGE_META[round.stage].icon;
              return (
                <motion.span
                  key={round.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35, delay: 0.1 + i * 0.06, ease: EASE }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--rd-border)] bg-[var(--rd-panel)] px-3 py-1.5 text-[12px] text-[var(--rd-text-muted)]"
                >
                  <Icon size={12} className="text-[var(--rd-accent-from)]" />
                  {STAGE_META[round.stage].label}:
                  <span className="font-medium text-[var(--rd-text)]">{winner?.label ?? "—"}</span>
                  <Check size={12} className="text-emerald-400" />
                </motion.span>
              );
            })}
          </div>
        )}

        {isLoading ? (
          <VoteSkeleton />
        ) : loadError ? (
          <p className="mt-8 text-sm text-[var(--rd-text-muted)]">{loadError}</p>
        ) : !currentRound ? (
          <p className="mt-8 text-sm text-[var(--rd-text-muted)]">
            No vote is open right now. Check back once the next round starts.
          </p>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05, ease: EASE }}
            className="mt-6 rounded-2xl border border-[var(--rd-border)] bg-[var(--rd-panel)] p-6"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.15em] text-[var(--rd-text-muted)]">
                  {STAGE_META[currentRound.stage].label} vote
                </p>
                <h2 className="font-display mt-1 text-xl font-semibold text-[var(--rd-text)]">
                  {currentRound.is_open ? `Choose the ${STAGE_META[currentRound.stage].label.toLowerCase()}` : "Voting closed"}
                </h2>
              </div>
              <div className="shrink-0 text-right">
                {currentRound.is_open ? (
                  <span className="rd-accent-gradient inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold tabular-nums text-black/80">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-black/40" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-black/60" />
                    </span>
                    <Clock size={12} />
                    {countdown}
                  </span>
                ) : (
                  winningOption && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: "spring", stiffness: 380, damping: 20 }}
                      className="rd-accent-gradient inline-block rounded-full px-3 py-1 text-[12px] font-semibold text-black/80"
                    >
                      Winner: {winningOption.label}
                    </motion.span>
                  )
                )}
                <p className="mt-1 text-[11px] text-[var(--rd-text-muted)]">{currentRound.total_votes} votes cast</p>
              </div>
            </div>

            <AnimatePresence>
              {voteError && (
                <motion.p
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.25, ease: EASE }}
                  role="alert"
                  className="overflow-hidden rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-[13px] text-red-400"
                >
                  {voteError}
                </motion.p>
              )}
            </AnimatePresence>

            <LayoutGroup>
              <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                {currentRound.options.map((option, i) => (
                  <VoteOptionCard
                    key={option.id}
                    option={option}
                    index={i}
                    isYourVote={currentRound.your_vote_option_id === option.id}
                    isWinner={currentRound.winner_option_id === option.id}
                    canVote={currentRound.is_open}
                    isPending={pendingOptionId === option.id}
                    isLocked={pendingOptionId !== null}
                    justVoted={justVotedId === option.id}
                    onVote={() => handleVote(option.id)}
                  />
                ))}
              </div>
            </LayoutGroup>

            {!currentRound.is_open && (
              <p className="mt-5 text-[13px] text-[var(--rd-text-muted)]">
                Waiting for the next round to open.
              </p>
            )}
          </motion.div>
        )}
      </div>
    </MotionConfig>
  );
}
