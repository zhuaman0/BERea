export interface ReadingBook {
  id:          string;
  title:       string;
  description: string;
  cover_url:   string | null;
  language:    string | null;
  genre:       string | null;
  page_count:  number | null;
  part_count:  number;
}

export interface BookPartAnswerWrite {
  text:       string;
  is_correct: boolean;
}

export interface BookPartQuestionWrite {
  text:    string;
  answers: BookPartAnswerWrite[];
}

export interface BookPartWrite {
  title:         string;
  points_reward: number;
  questions:     BookPartQuestionWrite[];
}

export interface ReadingBookWrite {
  title:       string;
  description: string;
  cover_url:   string | null;
  language:    string | null;
  genre:       string | null;
  page_count:  number | null;
  parts:       BookPartWrite[];
}

export interface BookPartEditorAnswer extends BookPartAnswerWrite { id: string }
export interface BookPartEditorQuestion extends Omit<BookPartQuestionWrite, "answers"> {
  id:      string;
  answers: BookPartEditorAnswer[];
}
export interface BookPartEditor extends Omit<BookPartWrite, "questions"> {
  id:        string;
  questions: BookPartEditorQuestion[];
}
export interface ReadingBookEditor extends ReadingBook {
  parts: BookPartEditor[];
}

export type BookPathPartStatus = "locked" | "available" | "completed";

export interface BookPathAnswer { id: string; text: string }
export interface BookPathQuestion { id: string; text: string; answers: BookPathAnswer[] }
export interface BookPathPart {
  id:            string;
  position:      number;
  title:         string;
  points_reward: number;
  status:        BookPathPartStatus;
  score:         number | null;
  questions:     BookPathQuestion[];
}
export interface BookPath {
  book:            ReadingBook;
  parts:           BookPathPart[];
  completed_parts: number;
  total_parts:     number;
  total_points:    number;
  is_complete:     boolean;
  is_captain:      boolean;
}

export interface BookPathAnswerSubmit { question_id: string; answer_id: string }

export interface BookPartAnswerReview {
  question_id:          string;
  question_text:        string;
  selected_answer_id:   string;
  selected_answer_text: string;
  correct_answer_id:    string;
  correct_answer_text:  string;
  is_correct:           boolean;
}

export interface BookPartAttempt {
  path:           BookPath;
  score:          number;
  passed:         boolean;
  points_awarded: number;
  review:         BookPartAnswerReview[];
}
