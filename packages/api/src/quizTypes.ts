export interface QuizAnswerOption {
  id:        string;
  text:      string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id:               string;
  text:             string;
  timeLimitSeconds: number;
  points:           number;
  answers:          QuizAnswerOption[];
}

export type QuizStatus = "draft" | "scheduled";

export interface Quiz {
  id:           string;
  title:        string;
  monthLabel:   string;
  scheduledFor: string | null;
  status:       QuizStatus;
  questions:    QuizQuestion[];
}
