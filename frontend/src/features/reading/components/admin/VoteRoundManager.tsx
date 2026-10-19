"use client";

import { useMemo, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Plus, Trash2, Crown, Clock } from "lucide-react";
import { readingVoteApi, readingBookApi } from "@berea/api";
import { CatalogBookPicker } from "./CatalogBookPicker";
import { isApiError } from "@/features/auth/utils";
import { useVoteRounds } from "../../hooks/useVoteRounds";
import { VoteSelectionSteps } from "../VoteSelectionSteps";
import { formatVoteCountdown, voteStatus, voteWinner } from "../../lib/voteRounds";

const inputBase = "w-full rounded-lg border border-[var(--rd-border)] bg-[var(--rd-ink)] px-3 py-2.5 text-sm text-[var(--rd-text)] focus:outline-none focus:border-[var(--rd-accent-from)]";
const buttonBase = "rd-accent-gradient rounded-lg px-5 py-2.5 text-sm font-semibold text-black/85 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40";
const MAX_OPTIONS = 12;

interface SelectionSchemaMessages {
  optionRequired: string;
  optionsUnique:  string;
}

function buildSelectionSchema(messages: SelectionSchemaMessages) {
  const optionsSchema = z.array(z.object({ label: z.string().trim().min(1, messages.optionRequired).max(120) }))
    .min(2).max(MAX_OPTIONS).refine((items) => new Set(items.map((item) => item.label.toLowerCase())).size === items.length, messages.optionsUnique);
  return z.object({
    languages: optionsSchema,
    genres: optionsSchema,
  });
}
type SelectionValues = z.infer<ReturnType<typeof buildSelectionSchema>>;

interface SelectionFormProps {
  disabled: boolean;
  onCreated: () => Promise<unknown>;
}

function SelectionForm({ disabled, onCreated }: SelectionFormProps) {
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations("reading.admin.voteManager");
  const tCommon = useTranslations("reading.admin.common");
  const selectionSchema = useMemo(
    () => buildSelectionSchema({ optionRequired: t("errors.optionRequired"), optionsUnique: t("errors.optionsUnique") }),
    [t],
  );
  const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm<SelectionValues>({
    resolver: zodResolver(selectionSchema),
    defaultValues: {
      languages: [{ label: "Kazakh" }, { label: "Russian" }, { label: "English" }],
      genres: [{ label: "Fiction" }, { label: "Fantasy" }, { label: "Mystery" }],
    },
  });
  const languages = useFieldArray({ control, name: "languages" });
  const genres = useFieldArray({ control, name: "genres" });

  async function onSubmit(values: SelectionValues) {
    setError(null);
    try {
      await readingVoteApi.createSelection({
        language_options: values.languages.map((option) => option.label),
        genre_options: values.genres.map((option) => option.label),
      });
      await onCreated();
    } catch (err: unknown) {
      setError(isApiError(err) ? err.detail : t("errors.startSelection"));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="rounded-2xl border border-[var(--rd-border)] bg-[var(--rd-panel)] p-5 sm:p-6">
      <h2 className="font-display text-lg font-semibold text-[var(--rd-text)]">{t("selection.title")}</h2>
      <p className="mt-2 text-sm text-[var(--rd-text-muted)]">{t("selection.body")}</p>
      {error && <p role="alert" className="mt-4 text-sm text-red-400">{error}</p>}
      <fieldset disabled={disabled || isSubmitting} className="mt-5 space-y-5 disabled:opacity-50">
        <div className="grid gap-5 sm:grid-cols-2">
          {([{ name: "languages", array: languages }, { name: "genres", array: genres }] as const).map(({ name, array }) => (
            <div key={name}>
              <h3 className="mb-3 text-sm font-medium text-[var(--rd-text)]">{t(`selection.${name}.title`)}</h3>
              <div className="space-y-2">
                {array.fields.map((field, index) => (
                  <div key={field.id}>
                    <div className="flex gap-2">
                      <input aria-label={t(`selection.${name}.option`, { number: index + 1 })} maxLength={120} className={inputBase} {...register(`${name}.${index}.label`)} />
                      <button type="button" aria-label={t(`selection.${name}.remove`, { number: index + 1 })} disabled={array.fields.length <= 2}
                        onClick={() => array.remove(index)} className="rounded-lg border border-[var(--rd-border)] px-3 text-[var(--rd-text-muted)] disabled:opacity-25"><Trash2 size={15} /></button>
                    </div>
                    {errors[name]?.[index]?.label && <p className="mt-1 text-xs text-red-400">{errors[name]?.[index]?.label?.message}</p>}
                  </div>
                ))}
                {(errors[name]?.root?.message || errors[name]?.message) && <p className="text-xs text-red-400">{errors[name]?.root?.message ?? errors[name]?.message}</p>}
              </div>
              <button type="button" disabled={array.fields.length >= MAX_OPTIONS} onClick={() => array.append({ label: "" })}
                className="mt-3 inline-flex items-center gap-1 text-xs text-[var(--rd-text)] disabled:opacity-40"><Plus size={14} /> {t("selection.addOption", { count: array.fields.length, max: MAX_OPTIONS })}</button>
            </div>
          ))}
        </div>
        <p className="text-sm text-[var(--rd-text-muted)]">{t("selection.closeTogether")}</p>
        <button type="submit" className={buttonBase}>{isSubmitting ? tCommon("starting") : t("selection.submit")}</button>
      </fieldset>
      {disabled && <p className="mt-3 text-xs text-[var(--rd-text-muted)]">{t("selection.waitForCurrent")}</p>}
    </form>
  );
}

function buildBookSchema(maxHoursMessage: string) {
  return z.object({ hours: z.number().positive().max(168, maxHoursMessage) });
}
type BookVoteValues = z.infer<ReturnType<typeof buildBookSchema>>;

interface BookVoteFormProps {
  language: string;
  genre: string;
  onCreated: () => Promise<unknown>;
}

function BookVoteForm({ language, genre, onCreated }: BookVoteFormProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations("reading.admin.voteManager");
  const tCommon = useTranslations("reading.admin.common");
  const bookSchema = useMemo(() => buildBookSchema(t("errors.maxHours")), [t]);
  const booksQuery = useQuery({ queryKey: ["reading-admin-books"], queryFn: readingBookApi.list, staleTime: 0, refetchOnWindowFocus: true });
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<BookVoteValues>({
    resolver: zodResolver(bookSchema), defaultValues: { hours: 6 },
  });

  async function onSubmit(values: BookVoteValues) {
    if (selectedIds.length < 2 || selectedIds.length > MAX_OPTIONS) { setError(t("errors.pickBooks", { min: 2, max: MAX_OPTIONS })); return; }
    setError(null);
    try {
      await readingVoteApi.createRound({ stage: "book", book_ids: selectedIds, duration_hours: values.hours });
      await onCreated();
    } catch (err: unknown) {
      setError(isApiError(err) ? err.detail : t("errors.startBook"));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="rounded-2xl border border-[var(--rd-accent-from)]/40 bg-[var(--rd-panel)] p-5 sm:p-6">
      <h2 className="font-display text-lg font-semibold text-[var(--rd-text)]">{t("book.title")}</h2>
      <p className="mb-5 mt-2 text-sm text-[var(--rd-text-muted)]">{t("book.body", { language, genre })}</p>
      {error && <p role="alert" className="mb-4 text-sm text-red-400">{error}</p>}
      {booksQuery.isPending ? <p className="text-sm text-[var(--rd-text-muted)]">{t("book.loadingCatalog")}</p>
        : booksQuery.error ? <p role="alert" className="text-sm text-red-400">{t("book.loadError")} <button type="button" className="underline" onClick={() => void booksQuery.refetch()}>{tCommon("retry")}</button></p>
        : <fieldset disabled={isSubmitting}>
          <CatalogBookPicker books={booksQuery.data ?? []} languageWinner={language} genreWinner={genre} selectedIds={selectedIds}
            onToggle={(id) => setSelectedIds((previous) => previous.includes(id) ? previous.filter((item) => item !== id) : previous.length < MAX_OPTIONS ? [...previous, id] : previous)} />
        </fieldset>}
      <label htmlFor="book-hours" className="mt-5 block text-sm text-[var(--rd-text)]">{t("book.durationLabel")}</label>
      <input id="book-hours" type="number" min="0.5" max="168" step="0.5" className={`${inputBase} mt-2 max-w-32`} {...register("hours", { valueAsNumber: true })} />
      {errors.hours && <p className="mt-2 text-xs text-red-400">{errors.hours.message}</p>}
      <div className="mt-5"><button type="submit" disabled={isSubmitting || booksQuery.isPending || Boolean(booksQuery.error)} className={buttonBase}>{isSubmitting ? tCommon("starting") : t("book.submit")}</button></div>
    </form>
  );
}

export function VoteRoundManager() {
  const { rounds, selection, currentRound, now, isPending, error, refetch } = useVoteRounds();
  const hasPendingRound = rounds.some((round) => voteStatus(round, now) !== "closed");
  const language = voteWinner(selection.findLast((round) => round.stage === "language"));
  const genre = voteWinner(selection.findLast((round) => round.stage === "genre"));
  const bookWinner = voteWinner(selection.findLast((round) => round.stage === "book"));
  const unresolved = selection.some((round) => round.status === "closed" && round.stage !== "book" && !round.winner_option_id);
  const canStartBook = !hasPendingRound && language && genre && !bookWinner;
  const t = useTranslations("reading.admin.voteManager");
  const tStages = useTranslations("reading.admin.stages");
  const tCommon = useTranslations("reading.admin.common");
  const format = useFormatter();

  function formatRoundDate(iso: string): string {
    return format.dateTime(new Date(iso), { dateStyle: "medium", timeStyle: "short" });
  }

  return (
    <div className="space-y-6">
      <VoteSelectionSteps rounds={selection} now={now} showPersonalProgress={false} />
      {error && <p role="alert" className="text-sm text-red-400">{isApiError(error) ? error.detail : t("errors.refresh")} <button type="button" className="underline" onClick={() => void refetch()}>{tCommon("retry")}</button></p>}
      {isPending && <p role="status" className="text-sm text-[var(--rd-text-muted)]">{t("loadingRounds")}</p>}
      {currentRound && voteStatus(currentRound, now) === "open" && <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--rd-accent-from)]/30 bg-[var(--rd-panel)] p-4 text-sm text-[var(--rd-text)]">
        <Clock size={16} /> {currentRound.stage === "book" ? t("open.book") : t("open.selection")} <span className="font-semibold tabular-nums">{t("open.timeLeft", { time: formatVoteCountdown(currentRound.closes_at, now) })}</span>
        <span className="text-[var(--rd-text-muted)]">{currentRound.stage === "book" ? t("votes", { count: currentRound.total_votes }) : selection.filter((round) => round.stage !== "book").map((round) => t("stageVotes", { stage: tStages(round.stage), count: round.total_votes })).join(" · ")}</span>
      </div>}
      {unresolved && !hasPendingRound && <p className="rounded-xl border border-amber-400/30 p-4 text-sm text-amber-300">
        {t("noWinner")}
      </p>}
      {canStartBook && <BookVoteForm key={selection[0]?.id} language={language} genre={genre} onCreated={refetch} />}
      <SelectionForm disabled={isPending || Boolean(error) || hasPendingRound} onCreated={refetch} />
      <section>
        <h2 className="font-display text-lg font-semibold text-[var(--rd-text)]">{t("results.title")}</h2>
        <p className="mt-2 text-xs text-[var(--rd-text-muted)]">{t("results.hint")}</p>
        {!isPending && !rounds.length && <p className="mt-4 text-sm text-[var(--rd-text-muted)]">{t("results.empty")}</p>}
        <div className="mt-4 space-y-3">
          {[...rounds].reverse().map((round) => (
            <details key={round.id} open={selection.some((item) => item.id === round.id)} className="rounded-xl border border-[var(--rd-border)] bg-[var(--rd-panel)] p-4">
              <summary className="cursor-pointer text-sm font-medium text-[var(--rd-text)]">
                {tStages(round.stage)} · {t(`status.${voteStatus(round, now)}`)} · {t("votes", { count: round.total_votes })}
              </summary>
              <p className="mt-3 text-xs text-[var(--rd-text-muted)]">{formatRoundDate(round.opens_at)} → {formatRoundDate(round.closes_at)}</p>
              <ul className="mt-4 space-y-2">
                {round.options.map((option) => <li key={option.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className={round.winner_option_id === option.id ? "font-semibold text-[var(--rd-accent-from)]" : "text-[var(--rd-text)]"}>
                    {round.winner_option_id === option.id && <Crown size={13} className="mr-2 inline" />}{option.label}
                  </span>
                  <span className="shrink-0 tabular-nums text-[var(--rd-text-muted)]">{option.vote_count} · {format.number(option.percent / 100, { style: "percent", maximumFractionDigits: 1 })}</span>
                </li>)}
              </ul>
              {round.is_tied && <p className="mt-3 text-xs text-amber-300">{t("results.tied")}</p>}
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
