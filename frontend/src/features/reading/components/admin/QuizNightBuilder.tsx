"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Clock, Loader2, Plus, Star, Trash2, X } from "lucide-react";
import { isApiError } from "@/features/auth/utils";
import { readingQuizApi } from "@berea/api";
import type { Quiz, QuizQuestion } from "@berea/api";
import { cn } from "@/shared/lib/utils";
import { BookExcerpt } from "../quizNight/BookExcerpt";
import { romanRound, roundTheme } from "../quizNight/roundTheme";

const DEFAULT_ROUNDS = 4;
const DEFAULT_QUESTIONS_PER_ROUND = 5;
const MAX_ROUNDS = 6;
const MAX_QUESTIONS_PER_ROUND = 6;
const TIME_LIMIT_OPTIONS = [15, 30, 45, 60];
const POINTS_OPTIONS = [1, 2, 3];

function genId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2);
}

function emptyQuestion(): QuizQuestion {
  return {
    id: genId(),
    text: "",
    timeLimitSeconds: 30,
    points: 1,
    kind: "open",
    answers: [],
    roundNumber: null,
    correctText: "",
    acceptedAnswers: [],
    quote: "",
    sourceRef: "",
  };
}

function emptyRound(): QuizQuestion[] {
  return Array.from({ length: DEFAULT_QUESTIONS_PER_ROUND }, emptyQuestion);
}

function groupIntoRounds(quiz: Quiz | undefined): QuizQuestion[][] {
  if (!quiz || quiz.questions.length === 0) return Array.from({ length: DEFAULT_ROUNDS }, emptyRound);
  const rounds = new Map<number, QuizQuestion[]>();
  for (const question of quiz.questions) {
    const round = question.roundNumber ?? 1;
    rounds.set(round, [...(rounds.get(round) ?? []), question]);
  }
  return [...rounds.entries()].sort(([a], [b]) => a - b).map(([, questions]) => questions);
}

function isBlank(question: QuizQuestion): boolean {
  return !question.text.trim() && !(question.correctText ?? "").trim();
}

interface QuizNightBuilderProps {
  initialQuiz?: Quiz;
}

/** Builder for the quiz-night format: rounds of open questions, each with its answer and book quote. */
export function QuizNightBuilder({ initialQuiz }: QuizNightBuilderProps) {
  const router = useRouter();
  const t = useTranslations("reading.admin.quizNightBuilder");
  const tNight = useTranslations("reading.night");
  const tCommon = useTranslations("reading.admin.common");

  const [title, setTitle] = useState(initialQuiz?.title ?? "");
  const [monthLabel, setMonthLabel] = useState(initialQuiz?.monthLabel ?? "");
  const [rounds, setRounds] = useState<QuizQuestion[][]>(() => groupIntoRounds(initialQuiz));
  const [activeRound, setActiveRound] = useState(0);
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [acceptedDraft, setAcceptedDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const roundQuestions = rounds[activeRound];
  const active = roundQuestions[activeQuestion];
  const theme = roundTheme(activeRound + 1);

  function select(round: number, question: number) {
    setActiveRound(round);
    setActiveQuestion(question);
    setAcceptedDraft("");
  }

  function updateActive(patch: Partial<QuizQuestion>) {
    setRounds((all) =>
      all.map((questions, r) =>
        r === activeRound ? questions.map((q, i) => (i === activeQuestion ? { ...q, ...patch } : q)) : questions,
      ),
    );
  }

  function addRound() {
    if (rounds.length >= MAX_ROUNDS) return;
    setRounds((all) => [...all, emptyRound()]);
    select(rounds.length, 0);
  }

  function removeRound(index: number) {
    if (rounds.length === 1) return;
    setRounds((all) => all.filter((_, r) => r !== index));
    select(Math.max(0, activeRound >= index ? activeRound - 1 : activeRound), 0);
  }

  function addQuestion() {
    if (roundQuestions.length >= MAX_QUESTIONS_PER_ROUND) return;
    setRounds((all) => all.map((questions, r) => (r === activeRound ? [...questions, emptyQuestion()] : questions)));
    select(activeRound, roundQuestions.length);
  }

  function removeQuestion(index: number) {
    if (roundQuestions.length === 1) return;
    setRounds((all) => all.map((questions, r) => (r === activeRound ? questions.filter((_, i) => i !== index) : questions)));
    select(activeRound, Math.max(0, activeQuestion >= index ? activeQuestion - 1 : activeQuestion));
  }

  function addAccepted() {
    const value = acceptedDraft.trim();
    if (!value || active.acceptedAnswers.includes(value)) return;
    updateActive({ acceptedAnswers: [...active.acceptedAnswers, value] });
    setAcceptedDraft("");
  }

  async function handleSave() {
    if (!title.trim()) {
      setError(t("errors.titleRequired"));
      return;
    }
    // Empty slots are skipped, and so are rounds left with no questions.
    const filled = rounds.map((questions) => questions.filter((q) => !isBlank(q))).filter((questions) => questions.length > 0);
    if (filled.length === 0) {
      setError(t("errors.noQuestions"));
      return;
    }
    for (const [r, questions] of rounds.entries()) {
      const invalid = questions.findIndex((q) => !isBlank(q) && (!q.text.trim() || !(q.correctText ?? "").trim()));
      if (invalid !== -1) {
        select(r, invalid);
        setError(t("errors.incomplete", { round: romanRound(r + 1), number: invalid + 1 }));
        return;
      }
    }
    setError(null);

    const quiz: Omit<Quiz, "id"> = {
      title:        title.trim(),
      monthLabel:   monthLabel.trim() || t("defaultMonth"),
      scheduledFor: initialQuiz?.scheduledFor ?? null,
      status:       initialQuiz?.status ?? "draft",
      format:       "rounds",
      questions: filled.flatMap((questions, r) =>
        questions.map((q) => ({
          ...q,
          text:            q.text.trim(),
          kind:            "open" as const,
          answers:         [],
          roundNumber:     r + 1,
          correctText:     (q.correctText ?? "").trim(),
          acceptedAnswers: q.acceptedAnswers,
          quote:           (q.quote ?? "").trim() || null,
          sourceRef:       (q.sourceRef ?? "").trim() || null,
        })),
      ),
    };
    setIsSaving(true);
    try {
      if (initialQuiz) await readingQuizApi.update(initialQuiz.id, quiz);
      else await readingQuizApi.create(quiz);
      router.push("/reading/admin");
    } catch (err) {
      setError(isApiError(err) ? err.detail : t("errors.save"));
      setIsSaving(false);
    }
  }

  return (
    <div className="w-full px-4 py-6 sm:px-8 sm:py-10 lg:px-12">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("titlePlaceholder")}
          aria-label={t("titlePlaceholder")}
          className="font-display flex-1 border-none bg-transparent text-2xl font-semibold text-[var(--rd-text)] placeholder:text-[var(--rd-text-muted)] focus:outline-none"
        />
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={isSaving}
          className="rd-accent-gradient inline-flex shrink-0 items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-black/85 transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {isSaving && <Loader2 size={15} className="animate-spin" />}
          {isSaving ? tCommon("saving") : t("save")}
        </button>
      </div>
      <input
        value={monthLabel}
        onChange={(e) => setMonthLabel(e.target.value)}
        placeholder={t("monthPlaceholder")}
        aria-label={t("monthPlaceholder")}
        className="mt-1 w-full border-none bg-transparent text-sm text-[var(--rd-text-muted)] placeholder:text-[var(--rd-text-muted)] focus:outline-none"
      />
      {error && <p role="alert" className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">{error}</p>}

      <div className="mt-6 flex flex-wrap items-center gap-2" role="tablist" aria-label={t("roundsLabel")}>
        {rounds.map((questions, r) => {
          const roundColors = roundTheme(r + 1);
          const selected = r === activeRound;
          return (
            <div key={r} className="group relative">
              <button
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => select(r, 0)}
                className={cn(
                  "font-display rounded-xl border-2 px-4 py-2 text-sm font-bold text-white transition-colors",
                  roundColors.border,
                  selected ? roundColors.fill : "bg-transparent",
                )}
              >
                {tNight("roundLabel", { roman: romanRound(r + 1) })}
                <span className="ml-2 text-xs font-medium opacity-75">{questions.filter((q) => !isBlank(q)).length}/{questions.length}</span>
              </button>
              {rounds.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRound(r)}
                  aria-label={t("removeRound", { round: romanRound(r + 1) })}
                  className="absolute -right-2 -top-2 hidden h-5 w-5 items-center justify-center rounded-full bg-[var(--rd-panel)] text-[var(--rd-text-muted)] ring-1 ring-[var(--rd-border)] hover:text-red-400 group-hover:flex"
                >
                  <X size={11} />
                </button>
              )}
            </div>
          );
        })}
        {rounds.length < MAX_ROUNDS && (
          <button
            type="button"
            onClick={addRound}
            className="flex items-center gap-1.5 rounded-xl border-2 border-dashed border-[var(--rd-border)] px-4 py-2 text-sm text-[var(--rd-text-muted)] hover:border-[var(--rd-accent-from)] hover:text-[var(--rd-accent-from)]"
          >
            <Plus size={14} /> {t("addRound")}
          </button>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[14rem_minmax(0,1fr)]">
        <div className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
          {roundQuestions.map((q, i) => (
            <button
              key={q.id}
              type="button"
              onClick={() => select(activeRound, i)}
              className={cn(
                "group flex min-w-40 items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs transition-colors lg:min-w-0",
                i === activeQuestion ? cn(theme.border, "bg-white/[0.04] text-[var(--rd-text)]") : "border-[var(--rd-border)] text-[var(--rd-text-muted)] hover:text-[var(--rd-text)]",
              )}
            >
              <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-bold text-white", theme.fill)}>{i + 1}</span>
              <span className="flex-1 truncate">{q.text.trim() || t("emptySlot")}</span>
              {roundQuestions.length > 1 && (
                <span
                  role="button"
                  tabIndex={0}
                  aria-label={t("deleteQuestion", { number: i + 1 })}
                  onClick={(e) => { e.stopPropagation(); removeQuestion(i); }}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); removeQuestion(i); } }}
                  className="opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
                >
                  <Trash2 size={12} />
                </span>
              )}
            </button>
          ))}
          {roundQuestions.length < MAX_QUESTIONS_PER_ROUND && (
            <button
              type="button"
              onClick={addQuestion}
              className="flex min-w-32 items-center justify-center gap-1.5 rounded-lg border border-dashed border-[var(--rd-border)] px-3 py-2 text-xs text-[var(--rd-text-muted)] hover:border-[var(--rd-accent-from)] hover:text-[var(--rd-accent-from)] lg:min-w-0"
            >
              <Plus size={13} /> {t("addQuestion")}
            </button>
          )}
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <div className="space-y-5 rounded-2xl border border-[var(--rd-border)] bg-[var(--rd-panel)] p-6">
            <p className="text-xs uppercase tracking-[0.1em] text-[var(--rd-text-muted)]">
              {t("questionLabel", { round: romanRound(activeRound + 1), number: activeQuestion + 1 })}
            </p>
            <Field label={t("question")}>
              <textarea
                value={active.text}
                onChange={(e) => updateActive({ text: e.target.value })}
                placeholder={t("questionPlaceholder")}
                rows={2}
                className={INPUT}
              />
            </Field>
            <Field label={t("correctAnswer")} hint={t("correctAnswerHint")}>
              <input
                value={active.correctText ?? ""}
                onChange={(e) => updateActive({ correctText: e.target.value })}
                placeholder={t("correctAnswerPlaceholder")}
                className={INPUT}
              />
            </Field>
            <Field label={t("acceptedAnswers")} hint={t("acceptedAnswersHint")}>
              <div className="flex flex-wrap gap-1.5">
                {active.acceptedAnswers.map((answer) => (
                  <span key={answer} className="inline-flex items-center gap-1 rounded-full border border-[var(--rd-border)] px-2.5 py-1 text-xs text-[var(--rd-text)]">
                    {answer}
                    <button
                      type="button"
                      onClick={() => updateActive({ acceptedAnswers: active.acceptedAnswers.filter((a) => a !== answer) })}
                      aria-label={t("removeAccepted", { answer })}
                      className="text-[var(--rd-text-muted)] hover:text-red-400"
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
              <input
                value={acceptedDraft}
                onChange={(e) => setAcceptedDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addAccepted(); } }}
                onBlur={addAccepted}
                placeholder={t("acceptedPlaceholder")}
                className={cn(INPUT, "mt-2")}
              />
            </Field>
            <Field label={t("quote")} hint={t("quoteHint")}>
              <textarea
                value={active.quote ?? ""}
                onChange={(e) => updateActive({ quote: e.target.value })}
                placeholder={t("quotePlaceholder")}
                rows={4}
                className={INPUT}
              />
            </Field>
            <Field label={t("sourceRef")}>
              <input
                value={active.sourceRef ?? ""}
                onChange={(e) => updateActive({ sourceRef: e.target.value })}
                placeholder={t("sourceRefPlaceholder")}
                className={INPUT}
              />
            </Field>
            <div className="flex flex-wrap gap-6">
              <OptionGroup
                icon={<Clock size={12} />}
                label={t("timeLimit")}
                options={TIME_LIMIT_OPTIONS}
                value={active.timeLimitSeconds}
                format={(v) => t("seconds", { count: v })}
                onChange={(v) => updateActive({ timeLimitSeconds: v })}
              />
              <OptionGroup
                icon={<Star size={12} />}
                label={t("points")}
                options={POINTS_OPTIONS}
                value={active.points}
                format={String}
                onChange={(v) => updateActive({ points: v })}
              />
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--rd-accent-from)]">{t("preview")}</p>
            <div className={cn("flex min-h-72 flex-col items-center justify-center gap-5 rounded-3xl border-[6px] bg-black px-6 py-10", theme.border)}>
              <p className="font-display text-center text-2xl font-bold text-white">
                {(active.correctText ?? "").trim() || t("previewAnswer")}
              </p>
              {(active.quote ?? "").trim() ? (
                <BookExcerpt quote={active.quote ?? ""} sourceRef={active.sourceRef} animate={false} size="preview" className="w-full" />
              ) : (
                <p className="text-sm text-[var(--rd-text-muted)]">{t("previewNoQuote")}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const INPUT =
  "w-full resize-none rounded-lg border border-[var(--rd-border)] bg-[var(--rd-ink)] px-3 py-2.5 text-sm text-[var(--rd-text)] placeholder:text-[var(--rd-text-muted)] focus:border-[var(--rd-accent-from)] focus:outline-none";

interface FieldProps {
  label:    string;
  hint?:    string;
  children: React.ReactNode;
}

function Field({ label, hint, children }: FieldProps) {
  return (
    <div role="group" aria-label={label}>
      <p className="text-xs font-medium text-[var(--rd-text)]">{label}</p>
      {hint && <p className="mt-0.5 text-[11px] text-[var(--rd-text-muted)]">{hint}</p>}
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

interface OptionGroupProps {
  icon:     React.ReactNode;
  label:    string;
  options:  number[];
  value:    number;
  format:   (value: number) => string;
  onChange: (value: number) => void;
}

function OptionGroup({ icon, label, options, value, format, onChange }: OptionGroupProps) {
  return (
    <div>
      <p className="mb-1.5 flex items-center gap-1.5 text-xs text-[var(--rd-text-muted)]">{icon} {label}</p>
      <div className="flex gap-1.5">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
              value === option
                ? "border-[var(--rd-accent-from)] text-[var(--rd-accent-from)]"
                : "border-[var(--rd-border)] text-[var(--rd-text-muted)] hover:text-[var(--rd-text)]",
            )}
          >
            {format(option)}
          </button>
        ))}
      </div>
    </div>
  );
}
