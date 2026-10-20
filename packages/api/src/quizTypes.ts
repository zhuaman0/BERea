export interface QuizAnswerOption {
  id:        string;
  text:      string;
  isCorrect: boolean;
}

export type QuizQuestionKind = "choice" | "open";

export interface QuizQuestion {
  id:               string;
  text:             string;
  timeLimitSeconds: number;
  points:           number;
  kind:             QuizQuestionKind;
  answers:          QuizAnswerOption[];
  /** Quiz-night fields (open questions). */
  roundNumber:      number | null;
  correctText:      string | null;
  acceptedAnswers:  string[];
  /** Book passage; `*italic*` and `==highlight==` markup. */
  quote:            string | null;
  sourceRef:        string | null;
}

export type QuizStatus = "draft" | "scheduled";

/** "instant" reveals after every question; "rounds" is the quiz-night format. */
export type QuizFormat = "instant" | "rounds";

export interface Quiz {
  id:           string;
  title:        string;
  monthLabel:   string;
  scheduledFor: string | null;
  status:       QuizStatus;
  format:       QuizFormat;
  questions:    QuizQuestion[];
}
