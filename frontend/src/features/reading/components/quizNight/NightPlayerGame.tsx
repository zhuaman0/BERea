"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import { readingQuizNightApi } from "@berea/api";
import { isApiError } from "@/features/auth/utils";
import { useNightState } from "../../hooks/useNightState";
import { QuizNightStage } from "./QuizNightStage";
import { TeamAnswerBox } from "./TeamAnswerBox";
import { TeamResultBadge } from "./TeamResultBadge";
import { romanRound } from "./roundTheme";

interface NightPlayerGameProps {
  sessionId: string;
  onLeave:   () => void;
}

/** A team member's phone: the same stage as the projector, plus the team's answer box. */
export function NightPlayerGame({ sessionId, onLeave }: NightPlayerGameProps) {
  const t = useTranslations("reading.night.player");
  const load = useCallback(() => readingQuizNightApi.playerState(sessionId), [sessionId]);
  const { state, error, setState } = useNightState(load);

  if (!state) {
    const notJoined = isApiError(error) && (error.status === 403 || error.status === 404 || error.status === 409);
    return (
      <div className="mt-20 text-center text-sm text-[var(--rd-text-muted)]">
        {notJoined ? (
          <>
            <p>{t("notJoined")}</p>
            <button type="button" onClick={onLeave} className="mt-3 font-medium text-[var(--rd-text)] underline">{t("enterNewPin")}</button>
          </>
        ) : (
          t("connecting")
        )}
      </div>
    );
  }

  const { phase, question, your_answer: yourAnswer } = state;
  const answering = phase === "question" || phase === "locked";

  return (
    <div className="flex w-full max-w-5xl flex-1 flex-col items-center gap-6">
      <div className="flex w-full items-center justify-between text-xs text-[var(--rd-text-muted)]">
        <span className="font-display font-semibold text-[var(--rd-text)]">{state.quiz_title}</span>
        {state.your_team_name && <span>{state.your_team_name}</span>}
      </div>

      <QuizNightStage state={state} isHost={false} />

      {phase === "board" && state.round_number < state.rounds.length && (
        <p className="text-sm text-[var(--rd-text-muted)]">{t("roundNext", { roman: romanRound(state.round_number + 1) })}</p>
      )}
      {answering && question && state.your_team_name && (
        <TeamAnswerBox
          key={question.id}
          sessionId={sessionId}
          questionId={question.id}
          serverText={yourAnswer?.text ?? ""}
          locked={phase === "locked"}
          onSaved={setState}
        />
      )}
      {answering && !state.your_team_name && (
        <p className="flex items-center gap-2 text-sm text-[var(--rd-text-muted)]"><Lock size={14} /> {t("noTeam")}</p>
      )}
      {phase === "answers_intro" && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="text-sm text-[var(--rd-text-muted)]">
          {t("answersComing")}
        </motion.p>
      )}
      {phase === "review_answer" && yourAnswer?.grade && <TeamResultBadge key={question?.id} answer={yourAnswer} />}
    </div>
  );
}
