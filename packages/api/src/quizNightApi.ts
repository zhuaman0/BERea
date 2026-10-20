import { readingApiClient } from "./readingApiClient";

export type NightPhase =
  | "lobby"
  | "board"
  | "round_intro"
  | "number"
  | "question"
  | "locked"
  | "answers_intro"
  | "review_number"
  | "review_question"
  | "review_answer"
  | "review_close"
  | "finished";

export type NightRoundStatus = "done" | "current" | "upcoming";
export type NightGrade = "correct" | "wrong";

export interface NightRound {
  number:         number;
  question_count: number;
  status:         NightRoundStatus;
}

export interface NightQuestion {
  id:                 string;
  text:               string;
  time_limit_seconds: number;
  points:             number;
}

export interface NightReveal {
  correct_text:       string;
  quote:              string | null;
  source_ref:         string | null;
  correct_team_count: number;
}

export interface NightYourAnswer {
  text:       string;
  updated_at: string | null;
  grade:      NightGrade | null;
  points:     number | null;
}

export interface NightTeamScore {
  team_name: string;
  score:     number;
}

export interface NightMarkingAnswer {
  id:         string;
  team_name:  string;
  text:       string;
  auto_grade: NightGrade;
  grade:      NightGrade;
  overridden: boolean;
}

export interface NightMarkingQuestion {
  question_number: number;
  question:        NightQuestion;
  correct_text:    string;
  answers:         NightMarkingAnswer[];
}

export interface NightState {
  id:                  string;
  pin:                 string;
  quiz_title:          string;
  phase:               NightPhase;
  rounds:              NightRound[];
  round_number:        number;
  question_number:     number;
  phase_time_left_ms:  number;
  question:            NightQuestion | null;
  reveal:              NightReveal | null;
  team_scores:         NightTeamScore[];
  teams_joined:        number;
  teams_answered:      number;
  your_team_name:      string | null;
  your_answer:         NightYourAnswer | null;
  marking:             NightMarkingQuestion[] | null;
}

const BASE = "/v1/reading/quiz-sessions";

export const readingQuizNightApi = {
  hostState: (sessionId: string) => readingApiClient.get<NightState>(`${BASE}/${sessionId}/night/host`),

  advance: (sessionId: string) => readingApiClient.post<NightState>(`${BASE}/${sessionId}/night/advance`, {}),

  playerState: (sessionId: string) => readingApiClient.get<NightState>(`${BASE}/${sessionId}/night/state`),

  saveAnswer: (sessionId: string, questionId: string, text: string) =>
    readingApiClient.put<NightState>(`${BASE}/${sessionId}/night/answer`, { question_id: questionId, text }),

  grade: (sessionId: string, answerId: string, grade: NightGrade | null) =>
    readingApiClient.patch<NightState>(`${BASE}/${sessionId}/night/answers/${answerId}`, { grade }),
};
