"use client";

import Link from "next/link";
import { ArrowRight, Clock, Vote } from "lucide-react";
import { useVoteRounds } from "../hooks/useVoteRounds";
import { formatVoteCountdown, voteStatus, voteWinner } from "../lib/voteRounds";
import { VoteSelectionSteps } from "./VoteSelectionSteps";

export function VoteStatusCard() {
  const { selection, currentRound, now, isPending, error, refetch } = useVoteRounds();
  const status = currentRound ? voteStatus(currentRound, now) : null;
  const winner = voteWinner(currentRound ?? undefined);
  const unresolved = selection.some((round) => round.stage !== "book" && round.status === "closed" && !round.winner_option_id);
  const language = selection.find((round) => round.stage === "language");
  const genre = selection.find((round) => round.stage === "genre");
  const bothSaved = Boolean(language?.your_vote_option_id && genre?.your_vote_option_id);
  const deadline = currentRound?.stage === "book" ? currentRound.closes_at : genre?.closes_at ?? currentRound?.closes_at;

  return (
    <section className="mb-6 rounded-2xl border border-[var(--rd-border)] bg-[var(--rd-panel)] p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display flex items-center gap-2 text-lg font-semibold text-[var(--rd-text)]"><Vote size={19} /> Our next book</h2>
          <p className="mt-2 text-sm text-[var(--rd-text-muted)]">
            {isPending ? "Loading the vote…" : error ? "Voting status is temporarily unavailable."
              : !currentRound ? "Language and genre voting will open here. Students have 6 hours in total."
              : status === "open" ? currentRound.stage === "book" ? "The book vote is open. Have your say!"
                : bothSaved ? "Your language and genre choices are saved. You can change either before the shared deadline."
                : language?.your_vote_option_id ? "Language saved. Choose your genre now — no waiting needed."
                : "Choose a language, then a genre. Both share one 6-hour deadline."
              : status === "scheduled" ? "The next voting stage opens soon."
              : currentRound.status !== "closed" ? "Updating voting results…"
              : currentRound.is_tied || !winner || unresolved ? "No clear winner yet. Waiting for another vote."
              : currentRound.stage === "book" ? `The students chose ${winner}.`
              : "Language and genre are chosen. The book vote is next."}
          </p>
        </div>
        <Link href="/reading/games" className="rd-accent-gradient inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-black/85">
          {status === "open" ? currentRound?.your_vote_option_id ? "View your vote" : "Vote now" : "View voting"}<ArrowRight size={15} />
        </Link>
      </div>
      {error ? <button type="button" onClick={() => void refetch()} className="mt-3 text-sm text-[var(--rd-text)] underline">Retry</button>
        : selection.length > 0 && <>
          <div className="mt-5"><VoteSelectionSteps rounds={selection} now={now} /></div>
          {currentRound && deadline && status === "open" && <p className="mt-4 flex items-center gap-2 text-xs tabular-nums text-[var(--rd-accent-from)]">
            <Clock size={14} /> {formatVoteCountdown(deadline, now)} left {currentRound.stage === "book" ? "in the book vote" : "for both choices"}
          </p>}
        </>}
    </section>
  );
}
