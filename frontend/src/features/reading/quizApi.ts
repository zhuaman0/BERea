import { readingApiClient } from "@/features/reading/lib/readingApiClient";
import type { Quiz, QuizStatus } from "@/features/reading/quizTypes";

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
  answers:            QuizAnswerDto[];
}

interface QuizDto {
  id:            string;
  title:         string;
  month_label:   string;
  scheduled_for: string | null;
  status:        QuizStatus;
  questions:     QuizQuestionDto[];
}

function fromDto(dto: QuizDto): Quiz {
  return {
    id:           dto.id,
    title:        dto.title,
    monthLabel:   dto.month_label,
    scheduledFor: dto.scheduled_for,
    status:       dto.status,
    questions: dto.questions.map((q) => ({
      id:               q.id,
      text:             q.text,
      timeLimitSeconds: q.time_limit_seconds,
      points:           q.points,
      answers:          q.answers.map((a) => ({ id: a.id, text: a.text, isCorrect: a.is_correct })),
    })),
  };
}

function toWriteBody(quiz: Omit<Quiz, "id">) {
  return {
    title:         quiz.title,
    month_label:   quiz.monthLabel,
    scheduled_for: quiz.scheduledFor,
    status:        quiz.status,
    questions: quiz.questions.map((q) => ({
      text:               q.text,
      time_limit_seconds: q.timeLimitSeconds,
      points:             q.points,
      answers:            q.answers.map((a) => ({ text: a.text, is_correct: a.isCorrect })),
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
