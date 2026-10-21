"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Crown,
  Lock,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
  X,
  Zap,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { bookCoverSrc, readingBookPathApi, type BookPartAnswerReview, type BookPathPart } from "@berea/api";
import { isApiError } from "@/features/auth/utils";
import { READING_PAGE_CONTAINER } from "@/features/reading/lib/pageContainer";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface CompletionResult {
  part:     BookPathPart;
  score:    number;
  points:   number;
  finished: boolean;
  passed:   boolean;
  review:   BookPartAnswerReview[];
}

export default function BookPathPage({ params }: PageProps) {
  const { id } = use(params);
  const t = useTranslations("reading.bookPath");
  const queryClient = useQueryClient();
  const queryKey = ["reading-book-path", id] as const;
  const pathQuery = useQuery({ queryKey, queryFn: () => readingBookPathApi.get(id), staleTime: 0 });
  const [activePart, setActivePart] = useState<BookPathPart | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CompletionResult | null>(null);

  const path = pathQuery.data;

  function startPart(part: BookPathPart) {
    if (part.status !== "available" || part.questions.length === 0) return;
    setActivePart(part);
    setQuestionIndex(0);
    setAnswers({});
    setError(null);
  }

  function closeQuiz() {
    if (isSubmitting) return;
    setActivePart(null);
    setQuestionIndex(0);
    setAnswers({});
    setError(null);
  }

  async function nextQuestion() {
    if (!activePart) return;
    const currentQuestion = activePart.questions[questionIndex];
    if (!answers[currentQuestion.id]) return;
    if (questionIndex < activePart.questions.length - 1) {
      setQuestionIndex((current) => current + 1);
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const attempt = await readingBookPathApi.complete(
        id,
        activePart.id,
        activePart.questions.map((question) => ({ question_id: question.id, answer_id: answers[question.id] })),
      );
      queryClient.setQueryData(queryKey, attempt.path);
      setActivePart(null);
      setResult({
        part: activePart,
        score: attempt.score,
        points: attempt.points_awarded,
        finished: attempt.path.is_complete,
        passed: attempt.passed,
        review: attempt.review,
      });
    } catch (submitError) {
      setError(isApiError(submitError) ? submitError.detail : t("errors.submit"));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (pathQuery.isPending) {
    return <div className={`${READING_PAGE_CONTAINER} space-y-5`}><div className="h-36 animate-pulse rounded-3xl bg-[var(--rd-panel)]" /><div className="mx-auto h-[520px] max-w-2xl animate-pulse rounded-3xl bg-[var(--rd-panel)]" /></div>;
  }

  if (pathQuery.error || !path) {
    return (
      <div className={READING_PAGE_CONTAINER}>
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-400">
          {isApiError(pathQuery.error) ? pathQuery.error.detail : t("errors.load")}
          <button type="button" onClick={() => void pathQuery.refetch()} className="ml-3 underline">{t("retry")}</button>
        </div>
      </div>
    );
  }

  const cover = bookCoverSrc(path.book.cover_url);
  const progress = path.total_parts ? Math.round((path.completed_parts / path.total_parts) * 100) : 0;
  const currentQuestion = activePart?.questions[questionIndex];
  const selectedAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;

  return (
    <div className={READING_PAGE_CONTAINER}>
      <Link href="/reading" className="inline-flex items-center gap-2 text-sm text-[var(--rd-text-muted)] transition-colors hover:text-[var(--rd-text)]">
        <ArrowLeft size={15} /> {t("back")}
      </Link>

      <header className="relative mt-5 overflow-hidden rounded-[28px] border border-[var(--rd-accent-from)]/20 bg-[var(--rd-panel)] p-6 sm:p-8">
        <Sparkles className="pointer-events-none absolute -right-5 -top-5 h-36 w-36 text-[var(--rd-accent-from)]/[0.06]" />
        <div className="relative flex items-center gap-5">
          <div className="flex h-24 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-[var(--rd-accent-from)] to-[#3a1f10] shadow-xl">
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element -- cover can be API-relative or admin-supplied
              <img src={cover} alt="" className="h-full w-full object-cover" />
            ) : <span className="font-display text-3xl font-bold text-black/25">{path.book.title.charAt(0)}</span>}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--rd-accent-from)]">{t("eyebrow")}</p>
            <h1 className="font-display mt-1 truncate text-3xl font-semibold text-[var(--rd-text)]">{path.book.title}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[var(--rd-text-muted)]">
              <span>{t("progress", { completed: path.completed_parts, total: path.total_parts })}</span>
              <span className="inline-flex items-center gap-1.5 text-[var(--rd-accent-from)]"><Zap size={14} /> {t("points", { count: path.total_points })}</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
              <motion.div className="rd-accent-gradient h-full rounded-full" initial={false} animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
            </div>
          </div>
        </div>
      </header>

      {!path.is_captain ? (
        <section className="mx-auto mt-10 max-w-xl rounded-3xl border border-[var(--rd-border)] bg-[var(--rd-panel)] p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--rd-accent-from)]/10 text-[var(--rd-accent-from)]"><Crown size={30} /></div>
          <h2 className="font-display mt-5 text-2xl font-semibold text-[var(--rd-text)]">{t("captainOnly.title")}</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--rd-text-muted)]">{t("captainOnly.body")}</p>
        </section>
      ) : path.parts.length === 0 ? (
        <section className="mx-auto mt-10 max-w-xl rounded-3xl border border-dashed border-[var(--rd-border)] p-8 text-center text-sm text-[var(--rd-text-muted)]">{t("empty")}</section>
      ) : (
        <section className="relative mx-auto mt-10 max-w-2xl pb-16">
          <div className="absolute bottom-16 left-1/2 top-10 w-1 -translate-x-1/2 rounded-full bg-[var(--rd-border)]" aria-hidden="true" />
          <div className="relative space-y-8">
            {path.parts.map((part, index) => {
              const completed = part.status === "completed";
              const available = part.status === "available";
              return (
                <motion.div key={part.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }} className="grid grid-cols-[minmax(0,1fr)_52px_minmax(0,1fr)] items-center">
                  <button
                    type="button"
                    onClick={() => startPart(part)}
                    disabled={!available}
                    className={`row-start-1 w-full rounded-2xl border p-3 text-left transition-all sm:p-4 ${index % 2 === 0 ? "col-start-1" : "col-start-3"} ${completed ? "border-emerald-400/30 bg-emerald-400/10" : available ? "border-[var(--rd-accent-from)] bg-[var(--rd-panel)] shadow-[0_0_28px_rgba(235,167,72,0.12)] hover:-translate-y-1" : "cursor-not-allowed border-[var(--rd-border)] bg-[var(--rd-panel)] opacity-55"}`}
                  >
                    <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--rd-text-muted)]">{t("part", { number: part.position })}</span>
                    <span className="mt-1 block font-display text-base font-semibold text-[var(--rd-text)] sm:text-lg">{part.title}</span>
                    <span className="mt-2 flex flex-col gap-1 text-[11px] text-[var(--rd-text-muted)] sm:flex-row sm:items-center sm:justify-between sm:text-xs">
                      <span>{completed ? t("completed", { score: part.score ?? 0 }) : available ? t("start") : t("locked")}</span>
                      <span className="inline-flex items-center gap-1 text-[var(--rd-accent-from)]"><Zap size={12} /> +{part.points_reward}</span>
                    </span>
                  </button>
                  <span className={`relative z-10 col-start-2 row-start-1 mx-auto flex h-12 w-12 items-center justify-center rounded-full border-4 border-[var(--rd-bg)] ${completed ? "bg-emerald-400 text-black" : available ? "rd-accent-gradient text-black" : "bg-[var(--rd-ink)] text-[var(--rd-text-muted)]"}`}>
                    {completed ? <Check size={20} strokeWidth={3} /> : available ? <Play size={19} fill="currentColor" /> : <Lock size={18} />}
                  </span>
                </motion.div>
              );
            })}
          </div>

          {path.is_complete && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative mx-auto mt-12 max-w-md rounded-3xl border border-amber-300/30 bg-gradient-to-b from-amber-300/15 to-[var(--rd-panel)] p-8 text-center shadow-[0_0_60px_rgba(251,191,36,0.1)]">
              <Trophy size={48} className="mx-auto text-amber-300" />
              <h2 className="font-display mt-4 text-3xl font-semibold text-[var(--rd-text)]">{t("victory.title")}</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--rd-text-muted)]">{t("victory.body", { title: path.book.title, points: path.total_points })}</p>
            </motion.div>
          )}
        </section>
      )}

      <AnimatePresence>
        {activePart && currentQuestion && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div role="dialog" aria-modal="true" className="w-full max-w-xl rounded-3xl border border-[var(--rd-border)] bg-[var(--rd-panel)] p-5 shadow-2xl sm:p-7" initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.98 }}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--rd-accent-from)]">{activePart.title}</p>
                  <p className="mt-1 text-sm text-[var(--rd-text-muted)]">{t("quiz.questionProgress", { current: questionIndex + 1, total: activePart.questions.length })}</p>
                </div>
                <button type="button" onClick={closeQuiz} aria-label={t("quiz.close")} className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--rd-border)] text-[var(--rd-text-muted)] hover:text-[var(--rd-text)]"><X size={17} /></button>
              </div>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/5"><motion.div className="rd-accent-gradient h-full" animate={{ width: `${((questionIndex + 1) / activePart.questions.length) * 100}%` }} /></div>
              <AnimatePresence mode="wait">
                <motion.div key={currentQuestion.id} initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }} className="mt-7">
                  <h2 className="font-display text-2xl font-semibold leading-snug text-[var(--rd-text)]">{currentQuestion.text}</h2>
                  <div className="mt-6 grid gap-3">
                    {currentQuestion.answers.map((answer, index) => {
                      const selected = selectedAnswer === answer.id;
                      return (
                        <button key={answer.id} type="button" onClick={() => setAnswers((current) => ({ ...current, [currentQuestion.id]: answer.id }))} className={`flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-sm transition-all ${selected ? "border-[var(--rd-accent-from)] bg-[var(--rd-accent-from)]/10 text-[var(--rd-text)]" : "border-[var(--rd-border)] bg-[var(--rd-ink)] text-[var(--rd-text-muted)] hover:border-[var(--rd-text-muted)]"}`}>
                          <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${selected ? "rd-accent-gradient text-black" : "bg-white/5"}`}>{String.fromCharCode(65 + index)}</span>
                          {answer.text}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              </AnimatePresence>
              {error && <p role="alert" className="mt-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">{error}</p>}
              <button type="button" disabled={!selectedAnswer || isSubmitting} onClick={() => void nextQuestion()} className="rd-accent-gradient mt-6 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold text-black transition-opacity disabled:cursor-not-allowed disabled:opacity-35">
                {isSubmitting ? t("quiz.finishing") : questionIndex === activePart.questions.length - 1 ? t("quiz.finish") : <>{t("quiz.next")} <ChevronRight size={17} /></>}
              </button>
            </motion.div>
          </motion.div>
        )}

        {result && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div role="dialog" aria-modal="true" className={`max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border bg-[var(--rd-panel)] p-6 text-center shadow-2xl sm:p-8 ${result.passed ? "border-amber-300/30" : "border-red-400/30"}`} initial={{ scale: 0.75, rotate: -2 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0.9, opacity: 0 }}>
              <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${result.passed ? "bg-amber-300/15 text-amber-300" : "bg-red-400/10 text-red-400"}`}>
                {result.passed ? <Trophy size={40} /> : <RotateCcw size={38} />}
              </div>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--rd-accent-from)]">{result.passed ? t("result.eyebrow") : t("result.retryEyebrow")}</p>
              <h2 className="font-display mt-2 text-3xl font-semibold text-[var(--rd-text)]">{result.passed ? result.finished ? t("result.bookFinished") : t("result.partFinished", { title: result.part.title }) : t("result.tryAgain")}</h2>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-[var(--rd-ink)] p-4"><span className="block text-2xl font-bold text-[var(--rd-text)]">{result.score}%</span><span className="text-xs text-[var(--rd-text-muted)]">{t("result.score")}</span></div>
                <div className="rounded-xl bg-[var(--rd-ink)] p-4"><span className="block text-2xl font-bold text-[var(--rd-accent-from)]">+{result.points}</span><span className="text-xs text-[var(--rd-text-muted)]">{t("result.points")}</span></div>
              </div>
              <div className="mt-5 space-y-3 text-left">
                {result.review.map((item, index) => (
                  <article key={item.question_id} className={`rounded-xl border p-4 ${item.is_correct ? "border-emerald-400/25 bg-emerald-400/5" : "border-red-400/25 bg-red-400/5"}`}>
                    <div className="flex items-start gap-2">
                      <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${item.is_correct ? "bg-emerald-400 text-black" : "bg-red-400 text-black"}`}>
                        {item.is_correct ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
                      </span>
                      <p className="text-sm font-medium text-[var(--rd-text)]">{index + 1}. {item.question_text}</p>
                    </div>
                    <p className={`mt-2 text-xs ${item.is_correct ? "text-emerald-300" : "text-red-300"}`}>{t("result.yourAnswer")}: {item.selected_answer_text}</p>
                    {!item.is_correct && <p className="mt-1 text-xs text-emerald-300">{t("result.correctAnswer")}: {item.correct_answer_text}</p>}
                  </article>
                ))}
              </div>
              <button type="button" onClick={() => {
                if (result.passed) {
                  setResult(null);
                } else {
                  const part = result.part;
                  setResult(null);
                  startPart(part);
                }
              }} className="rd-accent-gradient mt-6 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold text-black">
                {!result.passed && <RotateCcw size={16} />}
                {result.passed ? result.finished ? t("result.seeVictory") : t("result.continue") : t("result.retry")}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
