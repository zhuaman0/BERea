"use client";

import Link from "next/link";
import { ArrowRight, Clock, Vote } from "lucide-react";
import { useTranslations } from "next-intl";
import { useVoteRounds } from "../hooks/useVoteRounds";
import { formatVoteCountdown, voteStatus, voteWinner } from "../lib/voteRounds";
import { VoteSelectionSteps } from "./VoteSelectionSteps";

export function VoteStatusCard() {
  const t = useTranslations("reading.vote");
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
          <h2 className="font-display flex items-center gap-2 text-lg font-semibold text-[var(--rd-text)]"><Vote size={19} /> {t("status.title")}</h2>
          <p className="mt-2 text-sm text-[var(--rd-text-muted)]">
            {isPending ? t("loading") : error ? t("status.unavailable")
              : !currentRound ? t("status.notStarted")
              : status === "open" ? currentRound.stage === "book" ? t("status.bookOpen")
                : bothSaved ? t("status.bothSaved")
                : language?.your_vote_option_id ? t("status.languageSaved")
                : t("status.chooseBoth")
              : status === "scheduled" ? t("status.opensSoon")
              : currentRound.status !== "closed" ? t("status.updating")
              : currentRound.is_tied || !winner || unresolved ? t("status.noWinner")
              : currentRound.stage === "book" ? t("status.bookChosen", { winner })
              : t("status.bookNext")}
          </p>
        </div>
        <Link href="/reading/games" className="rd-accent-gradient inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-black/85">
          {status === "open" ? currentRound?.your_vote_option_id ? t("status.viewYourVote") : t("status.voteNow") : t("status.viewVoting")}<ArrowRight size={15} />
        </Link>
      </div>
      {error ? <button type="button" onClick={() => void refetch()} className="mt-3 text-sm text-[var(--rd-text)] underline">{t("retry")}</button>
        : selection.length > 0 && <>
          <div className="mt-5"><VoteSelectionSteps rounds={selection} now={now} /></div>
          {currentRound && deadline && status === "open" && <p className="mt-4 flex items-center gap-2 text-xs tabular-nums text-[var(--rd-accent-from)]">
            <Clock size={14} /> {t(currentRound.stage === "book" ? "status.leftBook" : "status.leftBoth", { time: formatVoteCountdown(deadline, now) })}
          </p>}
        </>}
    </section>
  );
}
