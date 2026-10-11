import { readingApiClient } from "@/features/reading/lib/readingApiClient";

export type LivePhase = "lobby" | "question" | "reveal" | "finished";

export interface LiveAnswerOption {
  id:           string;
  text:         string;
  is_correct:   boolean | null;
  picked_count: number | null;
}

export interface LiveQuestion {
  index:              number;
  total:              number;
  text:               string;
  points:             number;
  time_limit_seconds: number;
  time_left_ms:       number;
  answers:            LiveAnswerOption[];
}

export interface LivePlayer {
  name:      string;
  team_name: string | null;
  score:     number;
}

export interface LiveTeamScore {
  team_name: string;
  score:     number;
}

export interface LiveSummary {
  id:         string;
  pin:        string;
  quiz_title: string;
  phase:      LivePhase;
}

export interface LiveHostState {
  id:             string;
  pin:            string;
  quiz_title:     string;
  phase:          LivePhase;
  players:        LivePlayer[];
  question:       LiveQuestion | null;
  answered_count: number;
  team_scores:    LiveTeamScore[];
}

export interface LivePlayerState {
  id:                        string;
  quiz_title:                string;
  phase:                     LivePhase;
  player_count:              number;
  question:                  LiveQuestion | null;
  your_answer_id:            string | null;
  your_points_this_question: number | null;
  your_score:                number;
  your_rank:                 number;
  team_scores:               LiveTeamScore[];
}

const BASE = "/v1/reading/quiz-sessions";

export const readingLiveQuizApi = {
  start: (quizId: string) => readingApiClient.post<LiveSummary>(BASE, { quiz_id: quizId }),

  live: () => readingApiClient.get<LiveSummary | null>(`${BASE}/live`),

  join: (pin: string) => readingApiClient.post<LiveSummary>(`${BASE}/join`, { pin }),

  hostState: (sessionId: string) => readingApiClient.get<LiveHostState>(`${BASE}/${sessionId}/host`),

  next: (sessionId: string) => readingApiClient.post<LiveHostState>(`${BASE}/${sessionId}/next`, {}),

  playerState: (sessionId: string) => readingApiClient.get<LivePlayerState>(`${BASE}/${sessionId}/state`),

  answer: (sessionId: string, answerId: string) =>
    readingApiClient.post<LivePlayerState>(`${BASE}/${sessionId}/answer`, { answer_id: answerId }),
};
