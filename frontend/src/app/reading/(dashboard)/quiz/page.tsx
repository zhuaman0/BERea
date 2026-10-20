"use client";

import { use, useCallback, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Crown, Loader2, Lock, PartyPopper, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/shared/lib/utils";
import { isApiError } from "@/features/auth/utils";
import { readingLiveQuizApi, type LivePlayerState } from "@berea/api";
import { NightPlayerGame } from "@/features/reading/components/quizNight/NightPlayerGame";
import { ANSWER_TILES } from "@/features/reading/components/quiz/answerTiles";
import { useCountdownSeconds, usePolling } from "@berea/core";
import {
  parseJoinedSession,
  readJoinedSession,
  saveJoinedSession,
  serializeJoinedSession,
  type JoinedSession,
} from "@/features/reading/lib/liveQuizSession";

function subscribeToNothing(): () => void {
  return () => {};
}

function readNothingOnServer(): null {
  return null;
}

interface PageProps {
  searchParams: Promise<{ pin?: string }>;
}

export default function LiveQuizPlayerPage({ searchParams }: PageProps) {
  const { pin: pinFromLink } = use(searchParams);
  // The saved game survives a refresh; `choice` takes over once the player joins or leaves here.
  const savedSession = useSyncExternalStore(subscribeToNothing, readJoinedSession, readNothingOnServer);
  const [choice, setChoice] = useState<string | null | undefined>(undefined);
  const session = parseJoinedSession(choice === undefined ? savedSession : choice);

  function handleJoined(joined: JoinedSession) {
    saveJoinedSession(joined);
    setChoice(serializeJoinedSession(joined));
  }

  function handleLeave() {
    saveJoinedSession(null);
    setChoice(null);
  }

  return (
    <div className="flex min-h-full w-full flex-col items-center px-4 py-8 sm:px-8">
      {session?.format === "rounds" ? (
        <NightPlayerGame sessionId={session.id} onLeave={handleLeave} />
      ) : session ? (
        <PlayerGame sessionId={session.id} onLeave={handleLeave} />
      ) : (
        <JoinForm initialPin={pinFromLink ?? ""} onJoined={handleJoined} />
      )}
    </div>
  );
}

interface JoinFormProps {
  initialPin: string;
  onJoined:   (session: JoinedSession) => void;
}

function JoinForm({ initialPin, onJoined }: JoinFormProps) {
  const t = useTranslations("reading.quiz.join");
  const [pin, setPin] = useState(initialPin.replace(/\D/g, "").slice(0, 6));
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pin.length !== 6) {
      setError(t("pinLength"));
      return;
    }
    setError(null);
    setIsJoining(true);
    try {
      const session = await readingLiveQuizApi.join(pin);
      onJoined({ id: session.id, format: session.format });
    } catch (err) {
      setError(isApiError(err) ? err.detail : t("joinError"));
      setIsJoining(false);
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-10 w-full max-w-sm rounded-3xl border border-[var(--rd-border)] bg-[var(--rd-panel)] p-8 text-center"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--rd-accent-from)]">{t("eyebrow")}</p>
      <h1 className="font-display mt-2 text-2xl font-semibold text-[var(--rd-text)]">{t("title")}</h1>
      <p className="mt-1 text-sm text-[var(--rd-text-muted)]">{t("hint")}</p>
      <input
        value={pin}
        onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
        inputMode="numeric"
        autoFocus
        aria-label={t("pinLabel")}
        placeholder="000000"
        className="mt-6 h-16 w-full rounded-xl border border-[var(--rd-border)] bg-[var(--rd-ink)] text-center font-display text-3xl font-bold tracking-[0.4em] text-[var(--rd-text)] placeholder:text-[var(--rd-border)] focus:border-[var(--rd-accent-from)] focus:outline-none"
      />
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={isJoining}
        className="rd-accent-gradient mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl text-base font-semibold text-black/85 disabled:opacity-60"
      >
        {isJoining && <Loader2 size={17} className="animate-spin" />}
        {isJoining ? t("joining") : t("submit")}
      </button>
    </motion.form>
  );
}

interface PlayerGameProps {
  sessionId: string;
  onLeave:   () => void;
}

function PlayerGame({ sessionId, onLeave }: PlayerGameProps) {
  const t = useTranslations("reading.quiz.game");
  const load = useCallback(() => readingLiveQuizApi.playerState(sessionId), [sessionId]);
  const { data: state, error, setData } = usePolling(load, 1000);
  const [pendingAnswerId, setPendingAnswerId] = useState<string | null>(null);
  const [answerError, setAnswerError] = useState<string | null>(null);
  const secondsLeft = useCountdownSeconds(state?.question?.time_left_ms, `${state?.phase}-${state?.question?.index}`);

  async function handleAnswer(answerId: string) {
    if (pendingAnswerId || state?.your_answer_id) return;
    setPendingAnswerId(answerId);
    setAnswerError(null);
    try {
      setData(await readingLiveQuizApi.answer(sessionId, answerId));
    } catch (err) {
      setAnswerError(isApiError(err) ? err.detail : t("answerError"));
    } finally {
      setPendingAnswerId(null);
    }
  }

  if (!state) {
    const notJoined = isApiError(error) && (error.status === 403 || error.status === 404);
    return (
      <div className="mt-16 text-center text-sm text-[var(--rd-text-muted)]">
        {notJoined ? (
          <>
            <p>{t("notJoined")}</p>
            <button onClick={onLeave} className="mt-3 font-medium text-[var(--rd-text)] underline">
              {t("newPin")}
            </button>
          </>
        ) : (
          t("connecting")
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl">
      <div className="flex items-center justify-between text-sm text-[var(--rd-text-muted)]">
        <span className="font-display font-semibold text-[var(--rd-text)]">{state.quiz_title}</span>
        <span>
          {t("scoreLine", { score: state.your_score, rank: state.your_rank, total: state.player_count })}
        </span>
      </div>

      <AnimatePresence mode="wait">
        {state.phase === "lobby" && (
          <motion.div key="lobby" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="mt-20 text-center">
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 1.6, repeat: Infinity }}
              className="rd-accent-gradient mx-auto flex h-20 w-20 items-center justify-center rounded-full"
            >
              <Check size={36} className="text-black/80" strokeWidth={3} />
            </motion.div>
            <h1 className="font-display mt-6 text-3xl font-semibold text-[var(--rd-text)]">{t("lobbyTitle")}</h1>
            <p className="mt-2 text-[var(--rd-text-muted)]">
              {t("lobbyBody", { count: state.player_count })}
            </p>
          </motion.div>
        )}

        {state.phase === "question" && state.question && (
          <QuestionView
            key={`q-${state.question.index}`}
            state={state}
            secondsLeft={secondsLeft}
            pendingAnswerId={pendingAnswerId}
            onAnswer={handleAnswer}
          />
        )}

        {state.phase === "reveal" && state.question && (
          <RevealView key={`r-${state.question.index}`} state={state} />
        )}

        {state.phase === "finished" && (
          <motion.div key="done" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-16 text-center">
            <PartyPopper size={44} className="mx-auto text-[var(--rd-accent-from)]" />
            <h1 className="font-display mt-4 text-3xl font-semibold text-[var(--rd-text)]">{t("finishedTitle")}</h1>
            <p className="mt-2 text-lg text-[var(--rd-text-muted)]">
              {t.rich("finishedScore", {
                score: state.your_score,
                rank: state.your_rank,
                total: state.player_count,
                strong: (chunks) => <span className="font-semibold text-[var(--rd-text)]">{chunks}</span>,
              })}
            </p>
            {state.team_scores[0] && (
              <p className="rd-accent-gradient mx-auto mt-6 inline-flex items-center gap-2 rounded-full px-5 py-2 font-semibold text-black/85">
                <Crown size={16} /> {t("teamWins", { team: state.team_scores[0].team_name, score: state.team_scores[0].score })}
              </p>
            )}
            <div>
              <button onClick={onLeave} className="mt-8 text-sm font-medium text-[var(--rd-text-muted)] underline">
                {t("leave")}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {answerError && <p className="mt-4 text-center text-sm text-red-400">{answerError}</p>}
    </div>
  );
}

interface QuestionViewProps {
  state:           LivePlayerState;
  secondsLeft:     number;
  pendingAnswerId: string | null;
  onAnswer:        (answerId: string) => void;
}

function QuestionView({ state, secondsLeft, pendingAnswerId, onAnswer }: QuestionViewProps) {
  const t = useTranslations("reading.quiz.question");
  const question = state.question;
  if (!question) return null;
  const locked = Boolean(state.your_answer_id || pendingAnswerId);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="mt-6">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm text-[var(--rd-text-muted)]">
          {t("progress", { index: question.index + 1, total: question.total })}
        </span>
        <motion.span
          key={secondsLeft}
          initial={{ scale: 1.3 }}
          animate={{ scale: 1 }}
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full border-[3px] font-display text-xl font-bold",
            secondsLeft <= 3 ? "border-red-500 text-red-400" : "border-[var(--rd-accent-from)] text-[var(--rd-text)]"
          )}
        >
          {secondsLeft}
        </motion.span>
      </div>
      <h2 className="font-display mt-4 text-2xl font-semibold leading-snug text-[var(--rd-text)] sm:text-3xl">{question.text}</h2>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {question.answers.map((answer, i) => {
          const tile = ANSWER_TILES[i % ANSWER_TILES.length];
          const Icon = tile.icon;
          const isChosen = state.your_answer_id === answer.id || pendingAnswerId === answer.id;
          return (
            <motion.button
              key={answer.id}
              type="button"
              onClick={() => onAnswer(answer.id)}
              disabled={locked}
              whileTap={locked ? undefined : { scale: 0.96 }}
              animate={{ opacity: locked && !isChosen ? 0.35 : 1 }}
              className={cn(
                "flex min-h-24 items-center gap-4 rounded-2xl px-5 py-5 text-left text-white transition-shadow",
                tile.bg,
                isChosen && cn("ring-4", tile.ring),
                !locked && "hover:brightness-110"
              )}
            >
              <Icon size={24} className="shrink-0 fill-white/90" />
              <span className="flex-1 text-lg font-semibold">{answer.text}</span>
              {isChosen && (pendingAnswerId ? <Loader2 size={20} className="animate-spin" /> : <Lock size={18} />)}
            </motion.button>
          );
        })}
      </div>

      {state.your_answer_id && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 text-center text-[var(--rd-text-muted)]">
          {t("locked")}
        </motion.p>
      )}
    </motion.div>
  );
}

interface RevealViewProps {
  state: LivePlayerState;
}

function RevealView({ state }: RevealViewProps) {
  const t = useTranslations("reading.quiz.reveal");
  const question = state.question;
  if (!question) return null;
  const correct = question.answers.find((a) => a.is_correct);
  const gotIt = state.your_answer_id !== null && state.your_answer_id === correct?.id;
  const answered = state.your_answer_id !== null;

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="mt-14 text-center">
      <motion.div
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
        className={cn(
          "mx-auto flex h-24 w-24 items-center justify-center rounded-full",
          gotIt ? "bg-emerald-500" : "bg-red-500"
        )}
      >
        {gotIt ? <Check size={48} className="text-white" strokeWidth={3} /> : <X size={48} className="text-white" strokeWidth={3} />}
      </motion.div>
      <h2 className="font-display mt-6 text-3xl font-semibold text-[var(--rd-text)]">
        {gotIt ? t("correct") : answered ? t("wrong") : t("timeUp")}
      </h2>
      {gotIt && (
        <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-2 font-display text-2xl font-semibold text-emerald-400">
          +{state.your_points_this_question}
        </motion.p>
      )}
      {correct && (
        <p className="mt-3 text-[var(--rd-text-muted)]">
          {t.rich("answerWas", {
            answer: correct.text,
            strong: (chunks) => <span className="font-semibold text-[var(--rd-text)]">{chunks}</span>,
          })}
        </p>
      )}
      <p className="mt-6 text-sm text-[var(--rd-text-muted)]">
        {t("standing", { rank: state.your_rank, score: state.your_score })}{" "}
        {question.index + 1 < question.total ? t("nextQuestion") : t("finalResults")}
      </p>
    </motion.div>
  );
}
