import { readingApiClient } from "./readingApiClient";
import type { Quiz, QuizFormat, QuizQuestionKind, QuizStatus } from "./quizTypes";

interface QuizAnswerDto {
  id:         string;
  text:       string;
  is_correct: boolean;
}

interface QuizQuestionDto {
  id:                 string;
  text:               string;
  time_limit_seconds: number;
  points:             number;
  kind:               QuizQuestionKind;
  answers:            QuizAnswerDto[];
  round_number:       number | null;
  correct_text:       string | null;
  accepted_answers:   string[];
  quote:              string | null;
  source_ref:         string | null;
}

interface QuizDto {
  id:            string;
  title:         string;
  month_label:   string;
  scheduled_for: string | null;
  status:        QuizStatus;
  format:        QuizFormat;
  questions:     QuizQuestionDto[];
}

function fromDto(dto: QuizDto): Quiz {
  return {
    id:           dto.id,
    title:        dto.title,
    monthLabel:   dto.month_label,
    scheduledFor: dto.scheduled_for,
    status:       dto.status,
    format:       dto.format,
    questions: dto.questions.map((q) => ({
      id:               q.id,
      text:             q.text,
      timeLimitSeconds: q.time_limit_seconds,
      points:           q.points,
      kind:             q.kind,
      answers:          q.answers.map((a) => ({ id: a.id, text: a.text, isCorrect: a.is_correct })),
      roundNumber:      q.round_number,
      correctText:      q.correct_text,
      acceptedAnswers:  q.accepted_answers,
      quote:            q.quote,
      sourceRef:        q.source_ref,
    })),
  };
}

function toWriteBody(quiz: Omit<Quiz, "id">) {
  return {
    title:         quiz.title,
    month_label:   quiz.monthLabel,
    scheduled_for: quiz.scheduledFor,
    status:        quiz.status,
    format:        quiz.format,
    questions: quiz.questions.map((q) => ({
      text:               q.text,
      time_limit_seconds: q.timeLimitSeconds,
      points:             q.points,
      kind:               q.kind,
      answers:            q.answers.map((a) => ({ text: a.text, is_correct: a.isCorrect })),
      round_number:       q.roundNumber,
      correct_text:       q.correctText,
      accepted_answers:   q.acceptedAnswers,
      quote:              q.quote,
      source_ref:         q.sourceRef,
    })),
  };
}

export const readingQuizApi = {
  list: async () => (await readingApiClient.get<QuizDto[]>("/v1/reading/quizzes")).map(fromDto),

  get: async (id: string) => fromDto(await readingApiClient.get<QuizDto>(`/v1/reading/quizzes/${id}`)),

  create: async (quiz: Omit<Quiz, "id">) =>
    fromDto(await readingApiClient.post<QuizDto>("/v1/reading/quizzes", toWriteBody(quiz))),

  update: async (id: string, quiz: Omit<Quiz, "id">) =>
    fromDto(await readingApiClient.put<QuizDto>(`/v1/reading/quizzes/${id}`, toWriteBody(quiz))),

  remove: (id: string) => readingApiClient.delete(`/v1/reading/quizzes/${id}`),
};
