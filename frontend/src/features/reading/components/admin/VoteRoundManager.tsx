"use client";

import { useState } from "react";
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
import { formatVoteCountdown, VOTE_LABELS, voteStatus, voteWinner } from "../../lib/voteRounds";

const inputBase = "w-full rounded-lg border border-[var(--rd-border)] bg-[var(--rd-ink)] px-3 py-2.5 text-sm text-[var(--rd-text)] focus:outline-none focus:border-[var(--rd-accent-from)]";
const buttonBase = "rd-accent-gradient rounded-lg px-5 py-2.5 text-sm font-semibold text-black/85 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40";
const optionsSchema = z.array(z.object({ label: z.string().trim().min(1, "Enter an option").max(120) }))
  .min(2).max(12).refine((items) => new Set(items.map((item) => item.label.toLowerCase())).size === items.length, "Options must be unique");
const selectionSchema = z.object({
  languages: optionsSchema,
  genres: optionsSchema,
});
type SelectionValues = z.infer<typeof selectionSchema>;

interface SelectionFormProps {
  disabled: boolean;
  onCreated: () => Promise<unknown>;
}

function SelectionForm({ disabled, onCreated }: SelectionFormProps) {
  const [error, setError] = useState<string | null>(null);
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
      setError(isApiError(err) ? err.detail : "Couldn't start the selection. Check the options and try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="rounded-2xl border border-[var(--rd-border)] bg-[var(--rd-panel)] p-5 sm:p-6">
      <h2 className="font-display text-lg font-semibold text-[var(--rd-text)]">Start language + genre voting</h2>
      <p className="mt-2 text-sm text-[var(--rd-text-muted)]">
        One shared 6-hour window. Each student chooses a language, then immediately chooses a genre on the same page.
        Use the same language and genre names as in your book catalog.
      </p>
      {error && <p role="alert" className="mt-4 text-sm text-red-400">{error}</p>}
      <fieldset disabled={disabled || isSubmitting} className="mt-5 space-y-5 disabled:opacity-50">
        <div className="grid gap-5 sm:grid-cols-2">
          {([{ name: "languages", label: "Languages", array: languages }, { name: "genres", label: "Genres", array: genres }] as const).map(({ name, label, array }) => (
            <div key={name}>
              <h3 className="mb-3 text-sm font-medium text-[var(--rd-text)]">{label}</h3>
              <div className="space-y-2">
                {array.fields.map((field, index) => (
                  <div key={field.id}>
                    <div className="flex gap-2">
                      <input aria-label={`${label} option ${index + 1}`} maxLength={120} className={inputBase} {...register(`${name}.${index}.label`)} />
                      <button type="button" aria-label={`Remove ${label.toLowerCase()} option ${index + 1}`} disabled={array.fields.length <= 2}
                        onClick={() => array.remove(index)} className="rounded-lg border border-[var(--rd-border)] px-3 text-[var(--rd-text-muted)] disabled:opacity-25"><Trash2 size={15} /></button>
                    </div>
                    {errors[name]?.[index]?.label && <p className="mt-1 text-xs text-red-400">{errors[name]?.[index]?.label?.message}</p>}
                  </div>
                ))}
                {(errors[name]?.root?.message || errors[name]?.message) && <p className="text-xs text-red-400">{errors[name]?.root?.message ?? errors[name]?.message}</p>}
              </div>
              <button type="button" disabled={array.fields.length >= 12} onClick={() => array.append({ label: "" })}
                className="mt-3 inline-flex items-center gap-1 text-xs text-[var(--rd-text)] disabled:opacity-40"><Plus size={14} /> Add option ({array.fields.length}/12)</button>
            </div>
          ))}
        </div>
        <p className="text-sm text-[var(--rd-text-muted)]">Both choices close together, 6 hours after you start the selection.</p>
        <button type="submit" className={buttonBase}>{isSubmitting ? "Starting…" : "Start new 6-hour selection"}</button>
      </fieldset>
      {disabled && <p className="mt-3 text-xs text-[var(--rd-text-muted)]">A new selection can start after the current vote finishes.</p>}
    </form>
  );
}

const bookSchema = z.object({ hours: z.number().positive().max(168, "At most 7 days") });

interface BookVoteFormProps {
  language: string;
  genre: string;
  onCreated: () => Promise<unknown>;
}

function BookVoteForm({ language, genre, onCreated }: BookVoteFormProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const booksQuery = useQuery({ queryKey: ["reading-admin-books"], queryFn: readingBookApi.list, staleTime: 0, refetchOnWindowFocus: true });
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof bookSchema>>({
    resolver: zodResolver(bookSchema), defaultValues: { hours: 6 },
  });

  async function onSubmit(values: z.infer<typeof bookSchema>) {
    if (selectedIds.length < 2 || selectedIds.length > 12) { setError("Pick between 2 and 12 matching books"); return; }
    setError(null);
    try {
      await readingVoteApi.createRound({ stage: "book", book_ids: selectedIds, duration_hours: values.hours });
      await onCreated();
    } catch (err: unknown) {
      setError(isApiError(err) ? err.detail : "Couldn't start the book vote.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="rounded-2xl border border-[var(--rd-accent-from)]/40 bg-[var(--rd-panel)] p-5 sm:p-6">
      <h2 className="font-display text-lg font-semibold text-[var(--rd-text)]">Next: choose the book</h2>
      <p className="mb-5 mt-2 text-sm text-[var(--rd-text-muted)]">Students chose {language} · {genre}. Offer matching catalog books for the final vote.</p>
      {error && <p role="alert" className="mb-4 text-sm text-red-400">{error}</p>}
      {booksQuery.isPending ? <p className="text-sm text-[var(--rd-text-muted)]">Loading catalog…</p>
        : booksQuery.error ? <p role="alert" className="text-sm text-red-400">Couldn&apos;t load books. <button type="button" className="underline" onClick={() => void booksQuery.refetch()}>Retry</button></p>
        : <fieldset disabled={isSubmitting}>
          <CatalogBookPicker books={booksQuery.data ?? []} languageWinner={language} genreWinner={genre} selectedIds={selectedIds}
            onToggle={(id) => setSelectedIds((previous) => previous.includes(id) ? previous.filter((item) => item !== id) : previous.length < 12 ? [...previous, id] : previous)} />
        </fieldset>}
      <label htmlFor="book-hours" className="mt-5 block text-sm text-[var(--rd-text)]">Book vote duration (hours, separate from the 6-hour selection)</label>
      <input id="book-hours" type="number" min="0.5" max="168" step="0.5" className={`${inputBase} mt-2 max-w-32`} {...register("hours", { valueAsNumber: true })} />
      {errors.hours && <p className="mt-2 text-xs text-red-400">{errors.hours.message}</p>}
      <div className="mt-5"><button type="submit" disabled={isSubmitting || booksQuery.isPending || Boolean(booksQuery.error)} className={buttonBase}>{isSubmitting ? "Starting…" : "Start book vote"}</button></div>
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

  return (
    <div className="space-y-6">
      <VoteSelectionSteps rounds={selection} now={now} showPersonalProgress={false} />
      {error && <p role="alert" className="text-sm text-red-400">{isApiError(error) ? error.detail : "Couldn't refresh rounds."} <button type="button" className="underline" onClick={() => void refetch()}>Retry</button></p>}
      {isPending && <p role="status" className="text-sm text-[var(--rd-text-muted)]">Loading rounds…</p>}
      {currentRound && voteStatus(currentRound, now) === "open" && <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--rd-accent-from)]/30 bg-[var(--rd-panel)] p-4 text-sm text-[var(--rd-text)]">
        <Clock size={16} /> {currentRound.stage === "book" ? "Book" : "Language + genre"} voting is open <span className="font-semibold tabular-nums">{formatVoteCountdown(currentRound.closes_at, now)} left</span>
        <span className="text-[var(--rd-text-muted)]">{currentRound.stage === "book" ? `${currentRound.total_votes} votes` : selection.filter((round) => round.stage !== "book").map((round) => `${VOTE_LABELS[round.stage]}: ${round.total_votes}`).join(" · ")}</span>
      </div>}
      {unresolved && !hasPendingRound && <p className="rounded-xl border border-amber-400/30 p-4 text-sm text-amber-300">
        Language or genre has no clear winner (a tie or no votes). Start a new selection before the book vote.
      </p>}
      {canStartBook && <BookVoteForm key={selection[0]?.id} language={language} genre={genre} onCreated={refetch} />}
      <SelectionForm disabled={isPending || Boolean(error) || hasPendingRound} onCreated={refetch} />
      <section>
        <h2 className="font-display text-lg font-semibold text-[var(--rd-text)]">Voting results</h2>
        <p className="mt-2 text-xs text-[var(--rd-text-muted)]">Results update automatically. Ties and rounds without votes have no winner and must be repeated.</p>
        {!isPending && !rounds.length && <p className="mt-4 text-sm text-[var(--rd-text-muted)]">No votes yet. Start the first selection above.</p>}
        <div className="mt-4 space-y-3">
          {[...rounds].reverse().map((round) => (
            <details key={round.id} open={selection.some((item) => item.id === round.id)} className="rounded-xl border border-[var(--rd-border)] bg-[var(--rd-panel)] p-4">
              <summary className="cursor-pointer text-sm font-medium text-[var(--rd-text)]">
                {VOTE_LABELS[round.stage]} · {voteStatus(round, now)} · {round.total_votes} votes
              </summary>
              <p className="mt-3 text-xs text-[var(--rd-text-muted)]">{new Date(round.opens_at).toLocaleString()} → {new Date(round.closes_at).toLocaleString()}</p>
              <ul className="mt-4 space-y-2">
                {round.options.map((option) => <li key={option.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className={round.winner_option_id === option.id ? "font-semibold text-[var(--rd-accent-from)]" : "text-[var(--rd-text)]"}>
                    {round.winner_option_id === option.id && <Crown size={13} className="mr-2 inline" />}{option.label}
                  </span>
                  <span className="shrink-0 tabular-nums text-[var(--rd-text-muted)]">{option.vote_count} · {option.percent}%</span>
                </li>)}
              </ul>
              {round.is_tied && <p className="mt-3 text-xs text-amber-300">Tied vote — no winner.</p>}
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
