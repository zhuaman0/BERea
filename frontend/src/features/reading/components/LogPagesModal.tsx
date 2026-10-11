"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Modal } from "@/features/reading/components/Modal";
import { isApiError } from "@/features/auth/utils";
import { readingBookOfMonthApi, type BookOfMonthResult } from "@/features/reading/bookApi";

interface LogPagesModalProps {
  current: BookOfMonthResult;
  onClose: () => void;
  onSaved: (result: BookOfMonthResult) => void;
}

export function LogPagesModal({ current, onClose, onSaved }: LogPagesModalProps) {
  const maxPage = current.book.page_count ?? 5000;
  const schema = z.object({
    page: z.coerce
      .number({ invalid_type_error: "Enter a page number" })
      .int("Whole pages only")
      .min(0, "Pages can't be negative")
      .max(maxPage, `This book has ${maxPage} pages`),
  });
  type Values = z.infer<typeof schema>;

  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { page: current.your_page } });

  async function onSubmit({ page }: Values) {
    setServerError(null);
    try {
      onSaved(await readingBookOfMonthApi.logProgress(page));
      onClose();
    } catch (err) {
      setServerError(isApiError(err) ? err.detail : "Couldn't save your progress.");
    }
  }

  return (
    <Modal title={`Log pages · ${current.book.title}`} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="log-page" className="text-xs text-[var(--rd-text-muted)]">
            Which page are you on?
          </label>
          <div className="flex items-center gap-3">
            <input
              id="log-page"
              type="number"
              inputMode="numeric"
              autoFocus
              {...register("page")}
              className="h-12 w-32 rounded-lg border border-[var(--rd-border)] bg-[var(--rd-ink)] px-3 font-display text-xl font-semibold text-[var(--rd-text)] focus:border-[var(--rd-accent-from)] focus:outline-none"
            />
            {current.book.page_count && (
              <span className="text-sm text-[var(--rd-text-muted)]">of {current.book.page_count}</span>
            )}
          </div>
          {errors.page && <p className="text-[12px] text-red-400">{errors.page.message}</p>}
        </div>

        {serverError && <p className="text-[12px] text-red-400">{serverError}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="rd-accent-gradient inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-black/85 transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {isSubmitting && <Loader2 size={15} className="animate-spin" />}
          {isSubmitting ? "Saving…" : "Save progress"}
        </button>
      </form>
    </Modal>
  );
}
