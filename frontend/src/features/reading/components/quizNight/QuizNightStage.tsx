"use client";

import { AnimatePresence, LayoutGroup, MotionConfig } from "framer-motion";
import type { NightState } from "@berea/api";
import { NightLobby } from "./NightLobby";
import { NightPodium } from "./NightPodium";
import { RoundBoard } from "./RoundBoard";
import { AnswersBanner, NumberCard, QuestionFrame, RoundCard } from "./NightViews";

interface QuizNightStageProps {
  state:    NightState;
  isHost:   boolean;
  joinUrl?: string;
}

/**
 * The shared "projector" for host and players. Every phase renders inside one LayoutGroup, so
 * shapes with the same layoutId morph into each other however the phases arrive (A16).
 */
export function QuizNightStage({ state, isHost, joinUrl }: QuizNightStageProps) {
  const { phase, round_number: round, question_number: number, question } = state;
  const justFinished = phase === "board" && state.rounds[round - 1]?.status === "done" ? round : null;

  let view: React.ReactNode;
  switch (phase) {
    case "lobby":
      view = <NightLobby key="lobby" state={state} isHost={isHost} joinUrl={joinUrl} />;
      break;
    case "board":
      view = <RoundBoard key="board" rounds={state.rounds} justFinished={justFinished} compact={!isHost} />;
      break;
    case "round_intro":
      view = <RoundCard key={`round-${round}`} roundNumber={round} />;
      break;
    case "number":
    case "locked":
    case "review_number":
    case "review_close":
      view = <NumberCard key={`number-${round}-${number}`} roundNumber={round} questionNumber={number} />;
      break;
    case "question":
    case "review_question":
    case "review_answer":
      view = question && (
        <QuestionFrame
          key={`frame-${round}-${number}`}
          roundNumber={round}
          questionNumber={number}
          question={question}
          timer={phase === "question" ? { timeLeftMs: state.phase_time_left_ms, syncKey: question.id } : null}
          reveal={phase === "review_answer" ? state.reveal : null}
          showTeamCount={isHost}
        />
      );
      break;
    case "answers_intro":
      view = <AnswersBanner key={`answers-${round}`} roundNumber={round} lastQuestionNumber={number} />;
      break;
    case "finished":
      view = <NightPodium key="finished" teamScores={state.team_scores} yourTeamName={state.your_team_name} />;
      break;
  }

  return (
    <MotionConfig reducedMotion="user">
      <LayoutGroup id="quiz-night">
        <div className="flex w-full flex-1 items-center justify-center">
          <AnimatePresence mode="popLayout">{view}</AnimatePresence>
        </div>
      </LayoutGroup>
    </MotionConfig>
  );
}
