"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, Crown } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { readingVoteApi } from "@/features/reading/voteApi";
import { readingBookApi } from "@/features/reading/bookApi";
import type { ReadingBook } from "@/features/reading/bookTypes";
import { CatalogBookPicker } from "./CatalogBookPicker";
import { isApiError } from "@/features/auth/utils";
import type { VoteRound, VoteStage } from "@/features/reading/types";

const STAGES: { value: VoteStage; label: string }[] = [
  { value: "language", label: "Language" },
  { value: "genre",    label: "Genre" },
  { value: "book",     label: "Book" },
];

const roundSettingsSchema = z.object({
  stage:         z.enum(["language", "genre", "book"]),
  durationHours: z.coerce.number().positive().max(168),
});

type RoundSettingsValues = z.infer<typeof roundSettingsSchema>;

/** Label of the most recent closed round's winner for a stage, used to narrow the next stage. */
function latestWinner(rounds: VoteRound[], stage: VoteStage): string | null {
  const closed = rounds.filter((r) => r.stage === stage && !r.is_open && r.winner_option_id);
  const latest = closed[closed.length - 1];
  return latest?.options.find((o) => o.id === latest.winner_option_id)?.label ?? null;
}

const inputBase =
  "w-full rounded-lg border border-[var(--rd-border)] bg-[var(--rd-ink)] px-3 py-2.5 text-sm text-[var(--rd-text)] placeholder:text-[var(--rd-text-muted)] transition-colors focus:outline-none focus:border-[var(--rd-accent-from)]";

export function VoteRoundManager() {
  const [rounds, setRounds] = useState<VoteRound[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const [options, setOptions] = useState<string[]>(["", ""]);
  const [optionsError, setOptionsError] = useState<string | null>(null);
  const [books, setBooks] = useState<ReadingBook[]>([]);
  const [selectedBookIds, setSelectedBookIds] = useState<string[]>([]);
  const [onlyMatching, setOnlyMatching] = useState(true);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RoundSettingsValues>({
    resolver: zodResolver(roundSettingsSchema),
    defaultValues: { stage: "language", durationHours: 5 },
  });

  function loadRounds() {
    readingVoteApi
      .listRounds()
      .then(setRounds)
      .catch((err) => setLoadError(isApiError(err) ? err.detail : "Couldn't load rounds."))
      .finally(() => setIsLoading(false));
  }

  useEffect(loadRounds, []);

  useEffect(() => {
    readingBookApi.list().then(setBooks).catch(() => { /* picker shows the empty-catalog hint */ });
  }, []);

  const stage = useWatch({ control, name: "stage" });
  const isBookStage = stage === "book";

  function toggleBook(id: string) {
    setSelectedBookIds((prev) => (prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]));
  }

  function updateOption(i: number, value: string) {
    setOptions((prev) => prev.map((o, idx) => (idx === i ? value : o)));
  }

  function removeOption(i: number) {
    setOptions((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function onSubmit(values: RoundSettingsValues) {
    const cleaned = options.map((o) => o.trim()).filter(Boolean);
    if (values.stage === "book" ? selectedBookIds.length < 2 : cleaned.length < 2) {
      setOptionsError(values.stage === "book" ? "Pick at least 2 books" : "Add at least 2 options");
      return;
    }
    setOptionsError(null);
    setServerError(null);

    try {
      const created = await readingVoteApi.createRound(
        values.stage === "book"
          ? { stage: values.stage, book_ids: selectedBookIds, duration_hours: values.durationHours }
          : { stage: values.stage, options: cleaned, duration_hours: values.durationHours }
      );
      setRounds((prev) => [...prev, created]);
      reset({ stage: values.stage, durationHours: 5 });
      setOptions(["", ""]);
      setSelectedBookIds([]);
    } catch (err: unknown) {
      setServerError(isApiError(err) ? err.detail : "Couldn't create the round.");
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-2xl border border-[var(--rd-border)] bg-[var(--rd-panel)] p-6"
      >
        <h2 className="font-display text-lg font-semibold text-[var(--rd-text)]">Start a new round</h2>

        {serverError && (
          <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-[13px] text-red-400">
            {serverError}
          </p>
        )}

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wide text-[var(--rd-text-muted)]">Stage</label>
            <select className={inputBase} {...register("stage")}>
              {STAGES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wide text-[var(--rd-text-muted)]">
              Duration (hours)
            </label>
            <input type="number" step="0.5" className={inputBase} {...register("durationHours")} />
            {errors.durationHours && <p className="text-[11px] text-red-400">{errors.durationHours.message}</p>}
          </div>
        </div>

        {isBookStage ? (
          <div className="mt-4">
            <CatalogBookPicker
              books={books}
              languageWinner={latestWinner(rounds, "language")}
              genreWinner={latestWinner(rounds, "genre")}
              onlyMatching={onlyMatching}
              onOnlyMatchingChange={setOnlyMatching}
              selectedIds={selectedBookIds}
              onToggle={toggleBook}
            />
            {optionsError && <p className="mt-2 text-[11px] text-red-400">{optionsError}</p>}
          </div>
        ) : (
        <div className="mt-4 flex flex-col gap-2">
          <label className="text-xs font-medium uppercase tracking-wide text-[var(--rd-text-muted)]">Options</label>
          {options.map((option, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                placeholder={`Option ${i + 1}`}
                value={option}
                onChange={(e) => updateOption(i, e.target.value)}
                className={inputBase}
              />
              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(i)}
                  className="shrink-0 rounded-lg border border-[var(--rd-border)] p-2.5 text-[var(--rd-text-muted)] transition-colors hover:text-red-400"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          ))}
          {optionsError && <p className="text-[11px] text-red-400">{optionsError}</p>}
          <button
            type="button"
            onClick={() => setOptions((prev) => [...prev, ""])}
            className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-lg border border-[var(--rd-border)] px-3 py-1.5 text-[12px] text-[var(--rd-text)] transition-colors hover:border-[var(--rd-accent-from)]/50"
          >
            <Plus size={13} />
            Add option
          </button>
        </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="rd-accent-gradient mt-5 rounded-lg px-5 py-2.5 text-sm font-semibold text-black/85 transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
        >
          {isSubmitting ? "Starting…" : "Start round"}
        </button>
      </form>

      <div>
        <h2 className="font-display text-lg font-semibold text-[var(--rd-text)]">All rounds</h2>
        {isLoading ? (
          <p className="mt-3 text-sm text-[var(--rd-text-muted)]">Loading…</p>
        ) : loadError ? (
          <p className="mt-3 text-sm text-[var(--rd-text-muted)]">{loadError}</p>
        ) : rounds.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--rd-text-muted)]">No rounds yet.</p>
        ) : (
          <div className="mt-3 flex flex-col gap-3">
            {[...rounds].reverse().map((round) => (
              <div key={round.id} className="rounded-xl border border-[var(--rd-border)] bg-[var(--rd-panel)] p-5">
                <div className="flex items-center justify-between">
                  <p className="text-[13px] font-medium uppercase tracking-wide text-[var(--rd-text-muted)]">
                    {round.stage}
                  </p>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                      round.is_open
                        ? "bg-emerald-400/15 text-emerald-400"
                        : "border border-[var(--rd-border)] text-[var(--rd-text-muted)]"
                    )}
                  >
                    {round.is_open ? "Open" : "Closed"}
                  </span>
                </div>

                <div className="mt-3 flex flex-col gap-2">
                  {round.options.map((option) => (
                    <div key={option.id} className="flex items-center gap-3 text-[13px]">
                      <span
                        className={cn(
                          "w-32 shrink-0 truncate",
                          round.winner_option_id === option.id
                            ? "font-semibold text-[var(--rd-accent-from)]"
                            : "text-[var(--rd-text)]"
                        )}
                      >
                        {round.winner_option_id === option.id && <Crown size={12} className="mr-1 inline" />}
                        {option.label}
                      </span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--rd-border)]">
                        <div className="h-full rounded-full rd-accent-gradient" style={{ width: `${option.percent}%` }} />
                      </div>
                      <span className="w-24 shrink-0 text-right text-[var(--rd-text-muted)]">
                        {option.vote_count} ({option.percent}%)
                      </span>
                    </div>
                  ))}
                </div>

                <p className="mt-3 text-[11px] text-[var(--rd-text-muted)]">
                  {round.total_votes} total votes · closes {new Date(round.closes_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
