"use client";

import { useState } from "react";
import Link from "next/link";
import { LayoutGroup, MotionConfig, motion } from "framer-motion";
import { Check, Clock, Lock, RefreshCw, Vote } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { VoteRound } from "@berea/api";
import { VoteOptionCard } from "@/features/reading/components/VoteOptionCard";
import { VoteSelectionSteps } from "@/features/reading/components/VoteSelectionSteps";
import { useVoteRounds } from "@/features/reading/hooks/useVoteRounds";
import { formatVoteCountdown, voteStatus, voteWinner } from "@/features/reading/lib/voteRounds";
import { formatReadingDate, formatVoteDateTime } from "@/features/reading/lib/formatReadingDate";
import { isApiError } from "@/features/auth/utils";
import { READING_PAGE_CONTAINER } from "@/features/reading/lib/pageContainer";
import { ReadingPageHero } from "@/features/reading/components/layout/ReadingPageHero";

export default function ReadingGamesPage() {
  const t = useTranslations("reading.vote");
  const locale = useLocale();
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
      setVoteError(isApiError(err) ? err.detail : t("errors.saveFailed"));
    } finally {
      setPendingOptionId(null);
    }
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className={READING_PAGE_CONTAINER}>
        <ReadingPageHero
          eyebrow={t("page.eyebrow")}
          eyebrowIcon={Vote}
          title={t("page.title")}
          accent={t("page.accent")}
          description={t("page.description")}
          aside={deadline && isOpen && (
            <span className="rd-accent-gradient inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold tabular-nums text-black/85">
              <Clock size={15} aria-hidden="true" /> {t("timeLeft", { time: formatVoteCountdown(deadline, now) })}
            </span>
          )}
        />
        <div className="mt-8"><VoteSelectionSteps rounds={selection} now={now} /></div>

        {error && <div role="alert" className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          {isApiError(error) ? error.detail : t("errors.refreshFailed")}
          <button type="button" onClick={() => void refetch()} className="ml-3 inline-flex items-center gap-1 underline"><RefreshCw size={13} /> {t("retry")}</button>
        </div>}

        {isPending ? (
          <div role="status" className="mt-6 animate-pulse rounded-2xl border border-[var(--rd-border)] bg-[var(--rd-panel)] p-8 text-sm text-[var(--rd-text-muted)]">{t("loading")}</div>
        ) : !currentRound ? (
          !error && <div className="mt-6 rounded-2xl border border-dashed border-[var(--rd-border)] p-8 text-sm text-[var(--rd-text-muted)]">
            {t("page.notStarted")}
          </div>
        ) : (
          <section className="mt-6 rounded-2xl border border-[var(--rd-border)] bg-[var(--rd-panel)] p-4 sm:p-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row">
              <div>
                <h2 className="font-display text-xl font-semibold text-[var(--rd-text)]">{isBookVote ? t("page.bookVoteTitle") : t("page.selectionTitle")}</h2>
                <p className="mt-2 text-sm text-[var(--rd-text-muted)]">
                  {isBookVote ? t("page.bookVoteBody") : t("page.selectionBody")}
                </p>
              </div>
              {deadline && <div className="shrink-0 sm:text-right">
                <span className="rd-accent-gradient inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold tabular-nums text-black/85">
                  <Clock size={15} /> {isOpen ? t("timeLeft", { time: formatVoteCountdown(deadline, now) }) : t("page.closed")}
                </span>
                <p className="mt-2 text-xs text-[var(--rd-text-muted)]">{t(isBookVote ? "page.deadline" : "page.bothClose", { date: formatVoteDateTime(deadline, locale) })}</p>
              </div>}
            </div>

            {voteError && <p role="alert" className="mt-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">{voteError}</p>}
            {!isBookVote && bothSaved && <p role="status" className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-400/10 p-3 text-sm text-emerald-400">
              <Check size={16} /> {isOpen ? t("page.bothSavedOpen") : t("page.bothSaved")}
            </p>}

            <div className="mt-6 space-y-8">
              {displayRounds.map((round, roundIndex) => {
                const status = voteStatus(round, now);
                const needsLanguage = round.stage === "genre" && !language?.your_vote_option_id;
                const winner = voteWinner(round);
                return (
                  <motion.section key={round.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} aria-labelledby={`vote-${round.stage}`}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 id={`vote-${round.stage}`} className="font-display text-lg font-semibold text-[var(--rd-text)]">{!isBookVote && `${roundIndex + 1}. `}{t(`stages.${round.stage}`)}</h3>
                      <span className="text-xs text-[var(--rd-text-muted)]">{t("votes", { count: round.total_votes })}</span>
                    </div>
                    {needsLanguage && status === "open" && <p className="mt-2 flex items-center gap-2 text-sm text-[var(--rd-text-muted)]"><Lock size={14} /> {t("page.needsLanguage")}</p>}
                    {status === "scheduled" && <p className="mt-2 text-sm text-[var(--rd-text-muted)]">{t("page.opensAt", { date: formatVoteDateTime(round.opens_at, locale) })}</p>}
                    {round.your_vote_option_id && <p className="mt-2 text-sm text-emerald-400">{t("yourChoice", { choice: round.options.find((option) => option.id === round.your_vote_option_id)?.label ?? "" })}</p>}
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
                      {round.status !== "closed" ? t("page.updatingFinal") : winner ? t("page.winner", { winner }) : round.is_tied ? t("page.tiedNoWinner") : t("page.noVotesCast")}
                    </p>}
                  </motion.section>
                );
              })}
            </div>
            {!isOpen && displayRounds.every((round) => round.status === "closed") && <p className="mt-6 text-sm text-[var(--rd-text-muted)]">
              {isBookVote && currentRound.winner_option_id ? t.rich("page.bookChosen", { link: (chunks) => <Link href="/reading" className="text-[var(--rd-text)] underline">{chunks}</Link> })
                : unresolved || (isBookVote && !currentRound.winner_option_id) ? t("page.noClearWinner")
                : t("page.bookVoteNext")}
            </p>}
          </section>
        )}

        {history.length > 0 && <details className="mt-6 rounded-xl border border-[var(--rd-border)] p-4">
          <summary className="cursor-pointer text-sm font-medium text-[var(--rd-text)]">{t("history.title")}</summary>
          <ul className="mt-4 space-y-3 text-sm text-[var(--rd-text-muted)]">
            {[...history].reverse().map((round) => <li key={round.id} className="flex flex-wrap justify-between gap-2">
              <span>{t(`stages.${round.stage}`)} · {formatReadingDate(round.closes_at, locale, "dayMonth")}</span>
              <span>{voteWinner(round) ?? (round.is_tied ? t("tied") : t("history.noWinner"))} · {t("votes", { count: round.total_votes })}</span>
            </li>)}
          </ul>
        </details>}
      </div>
    </MotionConfig>
  );
}
