"use client";

import { useState } from "react";
import Link from "next/link";
import { LayoutGroup, MotionConfig, motion } from "framer-motion";
import { Check, Clock, Lock, RefreshCw } from "lucide-react";
import type { VoteRound } from "@berea/api";
import { VoteOptionCard } from "@/features/reading/components/VoteOptionCard";
import { VoteSelectionSteps } from "@/features/reading/components/VoteSelectionSteps";
import { useVoteRounds } from "@/features/reading/hooks/useVoteRounds";
import { formatVoteCountdown, VOTE_LABELS, voteStatus, voteWinner } from "@/features/reading/lib/voteRounds";
import { isApiError } from "@/features/auth/utils";
import { READING_PAGE_CONTAINER } from "@/features/reading/lib/pageContainer";

export default function ReadingGamesPage() {
  const { rounds, selection, currentRound, now, isPending, error, refetch, recordVote } = useVoteRounds();
  const [voteError, setVoteError] = useState<string | null>(null);
  const [pendingOptionId, setPendingOptionId] = useState<string | null>(null);
  const [justVotedId, setJustVotedId] = useState<string | null>(null);
  const language = selection.find((round) => round.stage === "language");
  const genre = selection.find((round) => round.stage === "genre");
  const isBookVote = currentRound?.stage === "book";
  const displayRounds = isBookVote ? [currentRound] : selection.filter((round) => round.stage !== "book");
  const deadline = isBookVote ? currentRound.closes_at : genre?.closes_at ?? language?.closes_at;
  const isOpen = displayRounds.some((round) => voteStatus(round, now) === "open");
  const bothSaved = Boolean(language?.your_vote_option_id && genre?.your_vote_option_id);
  const unresolved = selection.some((round) => round.stage !== "book" && round.status === "closed" && !round.winner_option_id);
  const history = rounds.filter((round) => !selection.some((item) => item.id === round.id));

  async function handleVote(round: VoteRound, optionId: string) {
    if (pendingOptionId || voteStatus(round, now) !== "open") return;
    if (round.stage === "genre" && !language?.your_vote_option_id) return;
    setVoteError(null);
    setPendingOptionId(optionId);
    try {
      await recordVote(round.id, optionId);
      setJustVotedId(optionId);
    } catch (err: unknown) {
      setVoteError(isApiError(err) ? err.detail : "Couldn't save your vote. Please try again.");
    } finally {
      setPendingOptionId(null);
    }
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className={READING_PAGE_CONTAINER}>
        <h1 className="font-display text-2xl font-semibold text-[var(--rd-text)]">Choose the book</h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--rd-text-muted)]">
          Choose a language, then immediately choose a genre below. Both choices share one 6-hour deadline.
          You can change either choice until voting closes.
        </p>
        <div className="mt-6"><VoteSelectionSteps rounds={selection} now={now} /></div>

        {error && <div role="alert" className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          {isApiError(error) ? error.detail : "Couldn't refresh voting. Please try again."}
          <button type="button" onClick={() => void refetch()} className="ml-3 inline-flex items-center gap-1 underline"><RefreshCw size={13} /> Retry</button>
        </div>}

        {isPending ? (
          <div role="status" className="mt-6 animate-pulse rounded-2xl border border-[var(--rd-border)] bg-[var(--rd-panel)] p-8 text-sm text-[var(--rd-text-muted)]">Loading the vote…</div>
        ) : !currentRound ? (
          !error && <div className="mt-6 rounded-2xl border border-dashed border-[var(--rd-border)] p-8 text-sm text-[var(--rd-text-muted)]">
            Voting hasn&apos;t started yet. Language and genre choices will appear here when the admin opens the selection.
          </div>
        ) : (
          <section className="mt-6 rounded-2xl border border-[var(--rd-border)] bg-[var(--rd-panel)] p-4 sm:p-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row">
              <div>
                <h2 className="font-display text-xl font-semibold text-[var(--rd-text)]">{isBookVote ? "Book vote" : "Language + genre"}</h2>
                <p className="mt-2 text-sm text-[var(--rd-text-muted)]">
                  {isBookVote ? "Vote for a book matching the winning language and genre." : "Two choices, one shared voting window. One vote per student for each choice."}
                </p>
              </div>
              {deadline && <div className="shrink-0 sm:text-right">
                <span className="rd-accent-gradient inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold tabular-nums text-black/85">
                  <Clock size={15} /> {isOpen ? `${formatVoteCountdown(deadline, now)} left` : "Voting closed"}
                </span>
                <p className="mt-2 text-xs text-[var(--rd-text-muted)]">{isBookVote ? "Deadline" : "Both choices close"}: {new Date(deadline).toLocaleString()}</p>
              </div>}
            </div>

            {voteError && <p role="alert" className="mt-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">{voteError}</p>}
            {!isBookVote && bothSaved && <p role="status" className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-400/10 p-3 text-sm text-emerald-400">
              <Check size={16} /> Both choices are saved.{isOpen && " You can still change either choice below."}
            </p>}

            <div className="mt-6 space-y-8">
              {displayRounds.map((round, roundIndex) => {
                const status = voteStatus(round, now);
                const needsLanguage = round.stage === "genre" && !language?.your_vote_option_id;
                const winner = voteWinner(round);
                return (
                  <motion.section key={round.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} aria-labelledby={`vote-${round.stage}`}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 id={`vote-${round.stage}`} className="font-display text-lg font-semibold text-[var(--rd-text)]">{!isBookVote && `${roundIndex + 1}. `}{VOTE_LABELS[round.stage]}</h3>
                      <span className="text-xs text-[var(--rd-text-muted)]">{round.total_votes} votes</span>
                    </div>
                    {needsLanguage && status === "open" && <p className="mt-2 flex items-center gap-2 text-sm text-[var(--rd-text-muted)]"><Lock size={14} /> Choose a language above to unlock genres immediately.</p>}
                    {status === "scheduled" && <p className="mt-2 text-sm text-[var(--rd-text-muted)]">Opens {new Date(round.opens_at).toLocaleString()}</p>}
                    {round.your_vote_option_id && <p className="mt-2 text-sm text-emerald-400">Your choice: {round.options.find((option) => option.id === round.your_vote_option_id)?.label}</p>}
                    <LayoutGroup id={round.id}>
                      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {round.options.map((option, index) => (
                          <VoteOptionCard key={option.id} option={option} index={index}
                            isYourVote={round.your_vote_option_id === option.id}
                            isWinner={round.winner_option_id === option.id}
                            canVote={status === "open" && !needsLanguage} isPending={pendingOptionId === option.id}
                            isLocked={pendingOptionId !== null} justVoted={justVotedId === option.id}
                            onVote={() => void handleVote(round, option.id)} />
                        ))}
                      </div>
                    </LayoutGroup>
                    {status === "closed" && <p className="mt-3 text-sm text-[var(--rd-text-muted)]">
                      {round.status !== "closed" ? "Updating the final results…" : winner ? `Winner: ${winner}` : round.is_tied ? "Tied vote — no winner." : "No votes were cast."}
                    </p>}
                  </motion.section>
                );
              })}
            </div>
            {!isOpen && displayRounds.every((round) => round.status === "closed") && <p className="mt-6 text-sm text-[var(--rd-text-muted)]">
              {isBookVote && currentRound.winner_option_id ? <>The book has been chosen. <Link href="/reading" className="text-[var(--rd-text)] underline">Open your dashboard</Link> to start reading.</>
                : unresolved || (isBookVote && !currentRound.winner_option_id) ? "No clear winner yet. Waiting for the admin to open another vote."
                : "The admin will open the book vote using the winning language and genre."}
            </p>}
          </section>
        )}

        {history.length > 0 && <details className="mt-6 rounded-xl border border-[var(--rd-border)] p-4">
          <summary className="cursor-pointer text-sm font-medium text-[var(--rd-text)]">Previous votes</summary>
          <ul className="mt-4 space-y-3 text-sm text-[var(--rd-text-muted)]">
            {[...history].reverse().map((round) => <li key={round.id} className="flex flex-wrap justify-between gap-2">
              <span>{VOTE_LABELS[round.stage]} · {new Date(round.closes_at).toLocaleDateString()}</span>
              <span>{voteWinner(round) ?? (round.is_tied ? "Tied vote" : "No winner")} · {round.total_votes} votes</span>
            </li>)}
          </ul>
        </details>}
      </div>
    </MotionConfig>
  );
}
