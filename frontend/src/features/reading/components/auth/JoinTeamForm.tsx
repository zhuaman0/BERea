"use client";

import { useState } from "react";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/shared/lib/utils";
import { readingAuthApi } from "@berea/api";
import { isApiError } from "@/features/auth/utils";
import { useReadingAuthStore } from "@/features/reading/store/useReadingAuthStore";

const joinTeamSchema = z.object({
  team_name: z.string().min(2, "At least 2 characters").max(120),
});

type JoinTeamValues = z.infer<typeof joinTeamSchema>;

const inputBase =
  "h-12 w-full rounded-xl border border-[var(--rd-border)] bg-[var(--rd-panel)] px-4 text-[13px] text-[var(--rd-text)] placeholder:text-[var(--rd-text-muted)] transition-colors focus:outline-none focus:border-[var(--rd-accent-from)]";

export function JoinTeamForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { updateUser } = useReadingAuthStore();

  const [teamName,     setTeamName]     = useState(() => searchParams.get("team") ?? "");
  const [fieldError,   setFieldError]   = useState<string | null>(null);
  const [serverError,  setServerError]  = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(value: string) {
    setTeamName(value);
    if (fieldError) setFieldError(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(null);

    const result = joinTeamSchema.safeParse({ team_name: teamName } satisfies JoinTeamValues);
    if (!result.success) {
      setFieldError(result.error.issues[0]?.message ?? "Enter a team name");
      return;
    }

    setIsSubmitting(true);
    try {
      const profile = await readingAuthApi.joinTeam(result.data);
      updateUser(profile);
      router.push(profile.payment_status ? "/reading" : "/reading/payment");
    } catch (err: unknown) {
      setServerError(
        isApiError(err) ? err.detail : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">

      {serverError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
          <p className="text-[13px] text-red-400">{serverError}</p>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <input
          id="join-team-name"
          type="text"
          value={teamName}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Team name"
          autoComplete="off"
          aria-label="Team name"
          className={cn(inputBase, fieldError && "border-red-400 focus:border-red-400")}
        />
        {fieldError ? (
          <p className="text-[11px] text-red-400">{fieldError}</p>
        ) : (
          <p className="text-[11px] text-[var(--rd-text-muted)]">
            Enter your existing team&apos;s name to join it, or a new name to create one.
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="rd-accent-gradient mt-2 h-12 w-full rounded-xl text-[14px] font-semibold text-[#1a0e05] transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-50 disabled:pointer-events-none inline-flex items-center justify-center gap-2"
      >
        {isSubmitting && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#1a0e05] border-t-transparent" />
        )}
        Continue
      </button>
    </form>
  );
}
