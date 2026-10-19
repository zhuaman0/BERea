"use client";

import { use, useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Check, Crown, Loader2, Users } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { isApiError } from "@/features/auth/utils";
import { readingLiveQuizApi, type LiveHostState } from "@berea/api";
import { ANSWER_TILES } from "@/features/reading/components/quiz/answerTiles";
import { useCountdownSeconds, usePolling } from "@berea/core";

const EASE = [0.16, 1, 0.3, 1] as const;

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

type NextStep = "start" | "reveal" | "nextQuestion" | "showFinal";

function nextStep(state: LiveHostState): NextStep | null {
  if (state.phase === "lobby") return "start";
  if (state.phase === "question") return "reveal";
  if (state.phase === "reveal" && state.question && state.question.index + 1 < state.question.total) return "nextQuestion";
  if (state.phase === "reveal") return "showFinal";
  return null;
}

export default function LiveQuizHostPage({ params }: PageProps) {
  const { sessionId } = use(params);
  const load = useCallback(() => readingLiveQuizApi.hostState(sessionId), [sessionId]);
  const { data: state, error, setData } = usePolling(load, 1000);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const t = useTranslations("reading.admin.live");
  const secondsLeft = useCountdownSeconds(state?.question?.time_left_ms, `${state?.phase}-${state?.question?.index}`);

  async function handleNext() {
    setIsAdvancing(true);
    setActionError(null);
    try {
      setData(await readingLiveQuizApi.next(sessionId));
    } catch (err) {
      setActionError(isApiError(err) ? err.detail : t("advanceError"));
    } finally {
      setIsAdvancing(false);
    }
  }

  if (!state) {
    return (
      <div className="p-8 text-sm text-[var(--rd-text-muted)]">
        {error ? (isApiError(error) ? error.detail : t("loadError")) : t("loading")}
      </div>
    );
  }

  const joinUrl = typeof window !== "undefined" ? `${window.location.origin}/reading/quiz` : "/reading/quiz";
  const isRevealed = state.phase === "reveal";
  const step = nextStep(state);

  return (
    <div className="flex min-h-full flex-col px-4 py-6 sm:px-8 lg:px-12">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--rd-accent-from)]">{t("label")}</p>
          <h1 className="font-display mt-1 text-3xl font-semibold text-[var(--rd-text)]">{state.quiz_title}</h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-[var(--rd-text-muted)]">
            <Users size={14} /> {t("playersJoined", { count: state.players.length })}
          </p>
        </div>
        {state.phase !== "finished" && (
          <div className="rounded-2xl border border-[var(--rd-accent-from)]/30 bg-[var(--rd-panel)] px-6 py-4 text-right">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--rd-text-muted)]">{t("joinAt", { url: joinUrl.replace(/^https?:\/\//, "") })}</p>
            <p className="font-display text-5xl font-bold tracking-[0.15em] text-[var(--rd-text)]">{state.pin}</p>
          </div>
        )}
      </div>

      {actionError && <p className="mt-4 text-sm text-red-400">{actionError}</p>}

      <div className="mt-8 flex-1">
        <AnimatePresence mode="wait">
          {state.phase === "lobby" && (
            <motion.div key="lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="text-lg text-[var(--rd-text-muted)]">{t("waiting")}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <AnimatePresence>
                  {state.players.map((p) => (
                    <motion.span
                      key={p.name + (p.team_name ?? "")}
                      layout
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 22 }}
                      className="rounded-full border border-[var(--rd-border)] bg-[var(--rd-panel)] px-4 py-2 text-sm font-medium text-[var(--rd-text)]"
                    >
                      {p.name}
                      {p.team_name && <span className="text-[var(--rd-text-muted)]"> · {p.team_name}</span>}
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {(state.phase === "question" || isRevealed) && state.question && (
            <motion.div
              key={`q-${state.question.index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              <div className="flex items-center justify-between gap-4 text-sm text-[var(--rd-text-muted)]">
                <span>
                  {t("questionMeta", { number: state.question.index + 1, total: state.question.total, points: state.question.points })}
                </span>
                <span>
                  {t("answered", { answered: state.answered_count, total: state.players.length })}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-6">
                <h2 className="font-display flex-1 text-3xl font-semibold leading-tight text-[var(--rd-text)] sm:text-4xl">
                  {state.question.text}
                </h2>
                {state.phase === "question" && (
                  <motion.span
                    key={secondsLeft}
                    initial={{ scale: 1.25 }}
                    animate={{ scale: 1 }}
                    className={cn(
                      "flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 font-display text-3xl font-bold",
                      secondsLeft <= 3 ? "border-red-500 text-red-400" : "border-[var(--rd-accent-from)] text-[var(--rd-text)]"
                    )}
                  >
                    {secondsLeft}
                  </motion.span>
                )}
              </div>

              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {state.question.answers.map((answer, i) => {
                  const tile = ANSWER_TILES[i % ANSWER_TILES.length];
                  const Icon = tile.icon;
                  const dimmed = isRevealed && !answer.is_correct;
                  return (
                    <motion.div
                      key={answer.id}
                      animate={{ opacity: dimmed ? 0.35 : 1, scale: isRevealed && answer.is_correct ? 1.02 : 1 }}
                      className={cn("flex items-center gap-4 rounded-2xl px-6 py-5 text-white", tile.bg)}
                    >
                      <Icon size={26} className="shrink-0 fill-white/90" />
                      <span className="flex-1 text-xl font-semibold">{answer.text}</span>
                      {isRevealed && (
                        <span className="flex items-center gap-2 text-lg font-bold">
                          {answer.picked_count ?? 0}
                          {answer.is_correct && <Check size={22} strokeWidth={3} />}
                        </span>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {isRevealed && <TeamBoard teams={state.team_scores} />}
            </motion.div>
          )}

          {state.phase === "finished" && (
            <motion.div key="finished" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="font-display text-4xl font-semibold text-[var(--rd-text)]">{t("finalResults")}</h2>
              <TeamBoard teams={state.team_scores} highlightWinner />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {state.phase !== "finished" && (
        <div className="sticky bottom-0 mt-8 flex justify-end bg-gradient-to-t from-[var(--rd-ink)] pt-6">
          <button
            type="button"
            onClick={handleNext}
            disabled={isAdvancing}
            className="rd-accent-gradient inline-flex items-center gap-2 rounded-xl px-8 py-4 text-lg font-semibold text-black/85 shadow-[0_10px_40px_-10px_var(--rd-accent-from)] transition-transform hover:-translate-y-0.5 disabled:opacity-60"
          >
            {isAdvancing && <Loader2 size={18} className="animate-spin" />}
            {step && t(`next.${step}`)}
          </button>
        </div>
      )}
    </div>
  );
}

interface TeamBoardProps {
  teams:            LiveHostState["team_scores"];
  highlightWinner?: boolean;
}

function TeamBoard({ teams, highlightWinner = false }: TeamBoardProps) {
  const t = useTranslations("reading.admin.live");
  if (teams.length === 0) return null;
  return (
    <div className="mt-8 rounded-2xl border border-[var(--rd-border)] bg-[var(--rd-panel)] p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--rd-text-muted)]">{t("teamStandings")}</p>
      <ol className="mt-4 flex flex-col gap-2">
        {teams.map((team, i) => (
          <motion.li
            key={team.team_name}
            layout
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-3",
              highlightWinner && i === 0 ? "rd-accent-gradient text-black/85" : "bg-[var(--rd-ink)] text-[var(--rd-text)]"
            )}
          >
            <span className="w-6 font-display text-lg font-bold">{i + 1}</span>
            {highlightWinner && i === 0 && <Crown size={18} />}
            <span className="flex-1 font-medium">{team.team_name}</span>
            <span className="font-display text-lg font-semibold tabular-nums">{team.score}</span>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}
