"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Circle, Clock, Diamond, Loader2, Plus, Square, Star, Trash2, Triangle } from "lucide-react";
import { isApiError } from "@/features/auth/utils";
import { readingQuizApi } from "@berea/api";
import type { Quiz, QuizAnswerOption, QuizQuestion } from "@berea/api";

const ANSWER_STYLES = [
  { color: "#ef4444", icon: Triangle },
  { color: "#3b82f6", icon: Diamond },
  { color: "#eab308", icon: Circle },
  { color: "#22c55e", icon: Square },
];

const TIME_LIMIT_OPTIONS = [5, 10, 20, 30, 60];
const POINTS_OPTIONS = [500, 1000, 2000];

function genId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

function emptyAnswer(): QuizAnswerOption {
  return { id: genId(), text: "", isCorrect: false };
}

function emptyQuestion(): QuizQuestion {
  return {
    id: genId(),
    text: "",
    timeLimitSeconds: 20,
    points: 1000,
    answers: [emptyAnswer(), emptyAnswer(), emptyAnswer(), emptyAnswer()],
  };
}

function isQuestionValid(q: QuizQuestion): boolean {
  const filled = q.answers.filter((a) => a.text.trim().length > 0);
  return q.text.trim().length > 0 && filled.length >= 2 && filled.some((a) => a.isCorrect);
}

interface QuizBuilderProps {
  initialQuiz?: Quiz;
}

export function QuizBuilder({ initialQuiz }: QuizBuilderProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialQuiz?.title ?? "");
  const [monthLabel, setMonthLabel] = useState(initialQuiz?.monthLabel ?? "");
  const [questions, setQuestions] = useState<QuizQuestion[]>(
    initialQuiz && initialQuiz.questions.length > 0 ? initialQuiz.questions : [emptyQuestion()]
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const active = questions[activeIndex];

  function updateActive(patch: Partial<QuizQuestion>) {
    setQuestions((qs) => qs.map((q, i) => (i === activeIndex ? { ...q, ...patch } : q)));
  }

  function updateAnswer(answerIndex: number, patch: Partial<QuizAnswerOption>) {
    updateActive({
      answers: active.answers.map((a, i) => (i === answerIndex ? { ...a, ...patch } : a)),
    });
  }

  function setCorrectAnswer(answerIndex: number) {
    updateActive({
      answers: active.answers.map((a, i) => ({ ...a, isCorrect: i === answerIndex })),
    });
  }

  function addQuestion() {
    setQuestions((qs) => [...qs, emptyQuestion()]);
    setActiveIndex(questions.length);
  }

  function removeQuestion(index: number) {
    if (questions.length === 1) return;
    setQuestions((qs) => qs.filter((_, i) => i !== index));
    setActiveIndex((i) => Math.max(0, i >= index ? i - 1 : i));
  }

  async function handleSave() {
    if (!title.trim()) {
      setError("Give the quiz a title.");
      return;
    }
    const invalidIndex = questions.findIndex((q) => !isQuestionValid(q));
    if (invalidIndex !== -1) {
      setActiveIndex(invalidIndex);
      setError(`Question ${invalidIndex + 1} needs question text, at least 2 answers, and one marked correct.`);
      return;
    }
    setError(null);

    const quiz: Omit<Quiz, "id"> = {
      title:        title.trim(),
      monthLabel:   monthLabel.trim() || "This month",
      scheduledFor: initialQuiz?.scheduledFor ?? null,
      status:       initialQuiz?.status ?? "draft",
      questions: questions.map((q) => ({
        ...q,
        text: q.text.trim(),
        answers: q.answers
          .filter((a) => a.text.trim().length > 0)
          .map((a) => ({ ...a, text: a.text.trim() })),
      })),
    };
    setIsSaving(true);
    try {
      if (initialQuiz) {
        await readingQuizApi.update(initialQuiz.id, quiz);
      } else {
        await readingQuizApi.create(quiz);
      }
      router.push("/reading/admin");
    } catch (err) {
      setError(isApiError(err) ? err.detail : "Couldn't save the quiz. Please try again.");
      setIsSaving(false);
    }
  }

  return (
    <div className="flex h-full">
      <div className="hidden w-56 shrink-0 flex-col gap-2 overflow-y-auto border-r border-[var(--rd-border)] p-4 md:flex">
        {questions.map((q, i) => (
          <button
            key={q.id}
            onClick={() => setActiveIndex(i)}
            className={`group flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs transition-colors ${
              i === activeIndex
                ? "border-[var(--rd-accent-from)] bg-white/[0.04] text-[var(--rd-text)]"
                : "border-[var(--rd-border)] text-[var(--rd-text-muted)] hover:text-[var(--rd-text)]"
            }`}
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current text-[10px]">
              {i + 1}
            </span>
            <span className="flex-1 truncate">{q.text.trim() || "Untitled question"}</span>
            {questions.length > 1 && (
              <span
                role="button"
                aria-label={`Delete question ${i + 1}`}
                onClick={(e) => { e.stopPropagation(); removeQuestion(i); }}
                className="opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
              >
                <Trash2 size={12} />
              </span>
            )}
          </button>
        ))}
        <button
          onClick={addQuestion}
          className="mt-2 flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-[var(--rd-border)] px-3 py-2 text-xs text-[var(--rd-text-muted)] transition-colors hover:border-[var(--rd-accent-from)] hover:text-[var(--rd-accent-from)]"
        >
          <Plus size={13} /> Add question
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-8 py-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Quiz title, e.g. Quiz #4"
              className="font-display flex-1 border-none bg-transparent text-2xl font-semibold text-[var(--rd-text)] placeholder:text-[var(--rd-text-muted)] focus:outline-none"
            />
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="rd-accent-gradient inline-flex shrink-0 items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-black/85 transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {isSaving && <Loader2 size={15} className="animate-spin" />}
              {isSaving ? "Saving…" : "Save quiz"}
            </button>
          </div>
          <input
            value={monthLabel}
            onChange={(e) => setMonthLabel(e.target.value)}
            placeholder="Month, e.g. November"
            className="mt-1 w-full border-none bg-transparent text-sm text-[var(--rd-text-muted)] placeholder:text-[var(--rd-text-muted)] focus:outline-none"
          />

          {error && (
            <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
              {error}
            </p>
          )}

          <div className="mt-6 flex gap-2 overflow-x-auto pb-1 md:hidden">
            {questions.map((q, i) => (
              <button
                key={q.id}
                onClick={() => setActiveIndex(i)}
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs ${
                  i === activeIndex
                    ? "border-[var(--rd-accent-from)] text-[var(--rd-accent-from)]"
                    : "border-[var(--rd-border)] text-[var(--rd-text-muted)]"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={addQuestion}
              aria-label="Add question"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-dashed border-[var(--rd-border)] text-[var(--rd-text-muted)]"
            >
              <Plus size={13} />
            </button>
          </div>

          <div className="mt-6 rounded-2xl border border-[var(--rd-border)] bg-[var(--rd-panel)] p-6">
            <p className="text-xs uppercase tracking-[0.1em] text-[var(--rd-text-muted)]">
              Question {activeIndex + 1}
            </p>
            <textarea
              value={active.text}
              onChange={(e) => updateActive({ text: e.target.value })}
              placeholder="Type your question…"
              rows={2}
              className="mt-2 w-full resize-none rounded-lg border border-[var(--rd-border)] bg-[var(--rd-ink)] px-3 py-2.5 text-sm text-[var(--rd-text)] placeholder:text-[var(--rd-text-muted)] focus:outline-none focus:border-[var(--rd-accent-from)]"
            />

            <div className="mt-4 flex flex-wrap gap-6">
              <div>
                <p className="mb-1.5 flex items-center gap-1.5 text-xs text-[var(--rd-text-muted)]">
                  <Clock size={12} /> Time limit
                </p>
                <div className="flex gap-1.5">
                  {TIME_LIMIT_OPTIONS.map((secs) => (
                    <button
                      key={secs}
                      onClick={() => updateActive({ timeLimitSeconds: secs })}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                        active.timeLimitSeconds === secs
                          ? "border-[var(--rd-accent-from)] text-[var(--rd-accent-from)]"
                          : "border-[var(--rd-border)] text-[var(--rd-text-muted)] hover:text-[var(--rd-text)]"
                      }`}
                    >
                      {secs}s
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-1.5 flex items-center gap-1.5 text-xs text-[var(--rd-text-muted)]">
                  <Star size={12} /> Points
                </p>
                <div className="flex gap-1.5">
                  {POINTS_OPTIONS.map((pts) => (
                    <button
                      key={pts}
                      onClick={() => updateActive({ points: pts })}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                        active.points === pts
                          ? "border-[var(--rd-accent-from)] text-[var(--rd-accent-from)]"
                          : "border-[var(--rd-border)] text-[var(--rd-text-muted)] hover:text-[var(--rd-text)]"
                      }`}
                    >
                      {pts}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <p className="mb-2 mt-6 text-xs text-[var(--rd-text-muted)]">
              Answers — click a tile to mark it correct.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {active.answers.map((answer, i) => {
                const style = ANSWER_STYLES[i];
                const Icon = style.icon;
                return (
                  <div
                    key={answer.id}
                    className="flex items-center gap-2 rounded-xl border-2 px-3 py-2.5 transition-colors"
                    style={{ borderColor: answer.isCorrect ? style.color : "var(--rd-border)" }}
                  >
                    <button
                      type="button"
                      onClick={() => setCorrectAnswer(i)}
                      aria-label={`Mark answer ${i + 1} correct`}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white"
                      style={{ backgroundColor: style.color }}
                    >
                      {answer.isCorrect ? <Check size={16} /> : <Icon size={14} fill="white" stroke="white" />}
                    </button>
                    <input
                      value={answer.text}
                      onChange={(e) => updateAnswer(i, { text: e.target.value })}
                      placeholder={`Answer ${i + 1}`}
                      className="min-w-0 flex-1 bg-transparent text-sm text-[var(--rd-text)] placeholder:text-[var(--rd-text-muted)] focus:outline-none"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
