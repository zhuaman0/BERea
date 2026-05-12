export interface ApiError {
  detail: string;
  status: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}

export type StudyMethod =
  | "pomodoro"
  | "spaced_repetition"
  | "active_recall"
  | "flashcard"
  | "practice_test"
  | "reading"
  | "youtube";

export type MaterialType =
  | "flashcard_deck"
  | "practice_test"
  | "youtube_summary"
  | "document"
  | "note";

export type PersonaTone = "kind" | "tough" | "intense";
