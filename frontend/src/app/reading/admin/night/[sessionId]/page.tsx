"use client";

import { use, useCallback, useState, useSyncExternalStore } from "react";
import { ChevronRight, Loader2, Maximize, Minimize, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { readingQuizNightApi, type NightState } from "@berea/api";
import { isApiError } from "@/features/auth/utils";
import { MarkingPanel } from "@/features/reading/components/quizNight/MarkingPanel";
import { QuizNightStage } from "@/features/reading/components/quizNight/QuizNightStage";
import { romanRound } from "@/features/reading/components/quizNight/roundTheme";
import { useNightState } from "@/features/reading/hooks/useNightState";

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

type NextLabel = "showBoard" | "startRound" | "finishNight" | "skip" | "startAnswers" | "showAnswer" | "next";

function nextLabel(state: NightState): NextLabel | null {
  switch (state.phase) {
    case "lobby":
      return "showBoard";
    case "board":
      return state.round_number >= state.rounds.length ? "finishNight" : "startRound";
    case "answers_intro":
      return "startAnswers";
    case "review_question":
      return "showAnswer";
    case "review_answer":
      return "next";
    case "finished":
      return null;
    default:
      return "skip";
  }
}

function subscribeToFullscreen(onChange: () => void): () => void {
  document.addEventListener("fullscreenchange", onChange);
  return () => document.removeEventListener("fullscreenchange", onChange);
}

function readFullscreen(): boolean {
  return document.fullscreenElement !== null;
}

function readFullscreenOnServer(): boolean {
  return false;
}

function subscribeToNothing(): () => void {
  return () => {};
}

function readOrigin(): string {
  return window.location.origin;
}

function readNoOrigin(): string {
  return "";
}

export default function QuizNightHostPage({ params }: PageProps) {
  const { sessionId } = use(params);
  const t = useTranslations("reading.night.host");
  const tNight = useTranslations("reading.night");
  const load = useCallback(() => readingQuizNightApi.hostState(sessionId), [sessionId]);
  const { state, error, setState } = useNightState(load);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const isFullscreen = useSyncExternalStore(subscribeToFullscreen, readFullscreen, readFullscreenOnServer);
  const origin = useSyncExternalStore(subscribeToNothing, readOrigin, readNoOrigin);

  async function advance() {
    setIsAdvancing(true);
    setActionError(null);
    try {
      setState(await readingQuizNightApi.advance(sessionId));
    } catch (err) {
      setActionError(isApiError(err) ? err.detail : t("advanceError"));
    } finally {
      setIsAdvancing(false);
    }
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen();
  }

  if (!state) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-[var(--rd-text-muted)]">
        {error ? (isApiError(error) ? error.detail : t("loadError")) : <Loader2 className="animate-spin" aria-label={t("loading")} />}
      </div>
    );
  }

  const label = nextLabel(state);
  const nextRound = state.round_number + 1;

  return (
    <div className="flex min-h-full flex-col bg-black">
      <div className="flex flex-1 flex-col items-center gap-8 px-4 py-8 sm:px-10">
        <QuizNightStage state={state} isHost joinUrl={origin ? `${origin}/reading/quiz?pin=${state.pin}` : undefined} />
        {state.phase === "answers_intro" && state.marking && (
          <MarkingPanel sessionId={sessionId} marking={state.marking} onChange={setState} />
        )}
      </div>

      <div className="sticky bottom-0 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/10 bg-black/90 px-4 py-3 backdrop-blur sm:px-10">
        <span className="font-display text-sm font-semibold text-[var(--rd-text)]">{state.quiz_title}</span>
        <span className="font-mono text-sm tracking-widest text-[var(--rd-text-muted)]">{t("pin", { pin: state.pin })}</span>
        <span className="flex items-center gap-1.5 text-sm text-[var(--rd-text-muted)]">
          <Users size={14} />
          {state.phase === "question"
            ? t("teamsAnswered", { answered: state.teams_answered, total: state.teams_joined })
            : t("teamsJoined", { count: state.teams_joined })}
        </span>
        <span className="text-xs text-[var(--rd-text-muted)]">{tNight(`phase.${state.phase}`)}</span>
        {actionError && <span role="alert" className="text-sm text-red-400">{actionError}</span>}

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? t("exitFullscreen") : t("fullscreen")}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--rd-border)] text-[var(--rd-text-muted)] hover:text-[var(--rd-text)]"
          >
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
          </button>
          {label && (
            <button
              type="button"
              onClick={() => void advance()}
              disabled={isAdvancing}
              className="rd-accent-gradient inline-flex h-10 items-center gap-2 rounded-lg px-5 text-sm font-semibold text-black/85 transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {isAdvancing ? <Loader2 size={15} className="animate-spin" /> : <ChevronRight size={16} />}
              {t(`next.${label}`, { roman: romanRound(nextRound) })}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
