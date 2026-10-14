"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import Link from "next/link";
import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import { Crown, Users } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { readingAuthApi } from "@berea/api";
import type { ReadingTeamInvitePreview } from "@berea/api";
import { isApiError } from "@/features/auth/utils";
import { useReadingAuthStore } from "@/features/reading/store/useReadingAuthStore";
import { nextReadingStage } from "@/features/reading/lib/nextStage";

const createTeamSchema = z.object({
  team_name: z.string().trim().min(2, "At least 2 characters").max(120),
});

const inputBase =
  "h-12 w-full rounded-xl border border-[var(--rd-border)] bg-[var(--rd-panel)] px-4 text-[13px] text-[var(--rd-text)] placeholder:text-[var(--rd-text-muted)] transition-colors focus:outline-none focus:border-[var(--rd-accent-from)]";

const primaryButton =
  "rd-accent-gradient inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[14px] font-semibold text-[#1a0e05] transition-opacity hover:opacity-90 active:opacity-80 disabled:pointer-events-none disabled:opacity-50";

function Spinner() {
  return <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#1a0e05] border-t-transparent" />;
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
      <p className="text-[13px] text-red-400">{message}</p>
    </div>
  );
}

function CreateTeamForm() {
  const router = useRouter();
  const { updateUser } = useReadingAuthStore();
  const [teamName,     setTeamName]     = useState("");
  const [fieldError,   setFieldError]   = useState<string | null>(null);
  const [serverError,  setServerError]  = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(null);
    const result = createTeamSchema.safeParse({ team_name: teamName });
    if (!result.success) {
      setFieldError(result.error.issues[0]?.message ?? "Enter a team name");
      return;
    }
    setIsSubmitting(true);
    try {
      const profile = await readingAuthApi.createTeam(result.data);
      updateUser(profile);
      router.push(nextReadingStage(profile));
    } catch (err: unknown) {
      setServerError(isApiError(err) ? err.detail : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {serverError && <ErrorBox message={serverError} />}
      <div className="flex flex-col gap-1.5">
        <input
          type="text"
          value={teamName}
          onChange={(e) => { setTeamName(e.target.value); setFieldError(null); }}
          placeholder="Team name"
          autoComplete="off"
          aria-label="Team name"
          className={cn(inputBase, fieldError && "border-red-400 focus:border-red-400")}
        />
        <p className={cn("text-[11px]", fieldError ? "text-red-400" : "text-[var(--rd-text-muted)]")}>
          {fieldError ?? "You'll be the captain: you invite players, pay the entry fee and design the team cover."}
        </p>
      </div>
      <button type="submit" disabled={isSubmitting} className={cn(primaryButton, "mt-2")}>
        {isSubmitting && <Spinner />}
        Create team
      </button>
      <p className="text-center text-[12px] text-[var(--rd-text-muted)]">
        Joining a friend&apos;s team? Ask your captain for the invite link and open it.
      </p>
    </form>
  );
}

function InviteJoin({ invite }: { invite: string }) {
  const router = useRouter();
  const { updateUser } = useReadingAuthStore();
  const [preview,     setPreview]     = useState<ReadingTeamInvitePreview | null>(null);
  const [loadError,   setLoadError]   = useState<string | null>(null);
  const [joinError,   setJoinError]   = useState<string | null>(null);
  const [isJoining,   setIsJoining]   = useState(false);

  useEffect(() => {
    readingAuthApi
      .previewInvite(invite)
      .then(setPreview)
      .catch((err) => setLoadError(isApiError(err) ? err.detail : "Couldn't open this invite."));
  }, [invite]);

  async function handleJoin() {
    setJoinError(null);
    setIsJoining(true);
    try {
      const profile = await readingAuthApi.joinTeam(invite);
      updateUser(profile);
      router.push(nextReadingStage(profile));
    } catch (err: unknown) {
      setJoinError(isApiError(err) ? err.detail : "Something went wrong. Please try again.");
    } finally {
      setIsJoining(false);
    }
  }

  const createInstead = (
    <Link
      href={"/reading/join-team" as Route}
      className="text-center text-[13px] text-[var(--rd-text-muted)] transition-colors hover:text-[var(--rd-text)]"
    >
      Create your own team instead
    </Link>
  );

  if (loadError) {
    return (
      <div className="flex flex-col gap-4">
        <ErrorBox message={`${loadError} Ask your captain for a new link.`} />
        {createInstead}
      </div>
    );
  }
  if (!preview) return <p className="text-[13px] text-[var(--rd-text-muted)]">Opening your invite…</p>;

  const isFull = preview.member_count >= preview.max_members;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-[var(--rd-accent-from)]/30 bg-[var(--rd-accent-from)]/[0.06] p-5">
        <p className="text-[12px] text-[var(--rd-text-muted)]">You&apos;re invited to join</p>
        <p className="mt-1 font-display text-2xl font-semibold text-[var(--rd-text)]">{preview.team_name}</p>
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-[var(--rd-text-muted)]">
          {preview.captain_name && (
            <span className="inline-flex items-center gap-1.5">
              <Crown size={14} className="text-[var(--rd-accent-from)]" />
              Captain {preview.captain_name}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <Users size={14} />
            {preview.member_count}/{preview.max_members} players
          </span>
        </div>
      </div>

      {joinError && <ErrorBox message={joinError} />}

      <button type="button" onClick={handleJoin} disabled={isJoining || isFull} className={primaryButton}>
        {isJoining && <Spinner />}
        {isFull ? "This team is full" : `Join ${preview.team_name}`}
      </button>
      {createInstead}
    </div>
  );
}

export function TeamStep() {
  const invite = useSearchParams().get("invite");
  return invite ? <InviteJoin invite={invite} /> : <CreateTeamForm />;
}
