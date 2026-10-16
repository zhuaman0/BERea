"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
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
import { PAYMENT_STEP_ENABLED } from "@/features/reading/lib/paymentStatus";

function createTeamSchema(t: (key: "teamNameTooShort") => string) {
  return z.object({
    team_name: z.string().trim().min(2, t("teamNameTooShort")).max(120),
  });
}

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
  const t       = useTranslations("reading.auth.team");
  const tErrors = useTranslations("reading.auth.errors");
  const teamSchema = useMemo(() => createTeamSchema(t), [t]);
  const [teamName,     setTeamName]     = useState("");
  const [fieldError,   setFieldError]   = useState<string | null>(null);
  const [serverError,  setServerError]  = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(null);
    const result = teamSchema.safeParse({ team_name: teamName });
    if (!result.success) {
      setFieldError(result.error.issues[0]?.message ?? t("teamNameRequired"));
      return;
    }
    setIsSubmitting(true);
    try {
      const profile = await readingAuthApi.createTeam(result.data);
      updateUser(profile);
      router.push(nextReadingStage(profile));
    } catch (err: unknown) {
      setServerError(isApiError(err) ? err.detail : tErrors("generic"));
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
          placeholder={t("teamNamePlaceholder")}
          autoComplete="off"
          aria-label={t("teamNamePlaceholder")}
          className={cn(inputBase, fieldError && "border-red-400 focus:border-red-400")}
        />
        <p className={cn("text-[11px]", fieldError ? "text-red-400" : "text-[var(--rd-text-muted)]")}>
          {fieldError ?? t(PAYMENT_STEP_ENABLED ? "captainHintWithPayment" : "captainHint")}
        </p>
      </div>
      <button type="submit" disabled={isSubmitting} className={cn(primaryButton, "mt-2")}>
        {isSubmitting && <Spinner />}
        {t("createTeam")}
      </button>
      <p className="text-center text-[12px] text-[var(--rd-text-muted)]">
        {t("joinFriendHint")}
      </p>
    </form>
  );
}

function InviteJoin({ invite }: { invite: string }) {
  const router = useRouter();
  const { updateUser } = useReadingAuthStore();
  const t       = useTranslations("reading.auth.team");
  const tErrors = useTranslations("reading.auth.errors");
  const [preview,     setPreview]     = useState<ReadingTeamInvitePreview | null>(null);
  const [loadError,   setLoadError]   = useState<string | null>(null);
  const [joinError,   setJoinError]   = useState<string | null>(null);
  const [isJoining,   setIsJoining]   = useState(false);

  useEffect(() => {
    readingAuthApi
      .previewInvite(invite)
      .then(setPreview)
      .catch((err) => setLoadError(isApiError(err) ? err.detail : t("inviteLoadFailed")));
  }, [invite, t]);

  async function handleJoin() {
    setJoinError(null);
    setIsJoining(true);
    try {
      const profile = await readingAuthApi.joinTeam(invite);
      updateUser(profile);
      router.push(nextReadingStage(profile));
    } catch (err: unknown) {
      setJoinError(isApiError(err) ? err.detail : tErrors("generic"));
    } finally {
      setIsJoining(false);
    }
  }

  const createInstead = (
    <Link
      href={"/reading/join-team" as Route}
      className="text-center text-[13px] text-[var(--rd-text-muted)] transition-colors hover:text-[var(--rd-text)]"
    >
      {t("createInstead")}
    </Link>
  );

  if (loadError) {
    return (
      <div className="flex flex-col gap-4">
        <ErrorBox message={t("askForNewLink", { error: loadError })} />
        {createInstead}
      </div>
    );
  }
  if (!preview) return <p className="text-[13px] text-[var(--rd-text-muted)]">{t("openingInvite")}</p>;

  const isFull = preview.member_count >= preview.max_members;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-[var(--rd-accent-from)]/30 bg-[var(--rd-accent-from)]/[0.06] p-5">
        <p className="text-[12px] text-[var(--rd-text-muted)]">{t("invitedToJoin")}</p>
        <p className="mt-1 font-display text-2xl font-semibold text-[var(--rd-text)]">{preview.team_name}</p>
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-[var(--rd-text-muted)]">
          {preview.captain_name && (
            <span className="inline-flex items-center gap-1.5">
              <Crown size={14} className="text-[var(--rd-accent-from)]" />
              {t("captain", { name: preview.captain_name })}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <Users size={14} />
            {t("players", { count: preview.member_count, max: preview.max_members })}
          </span>
        </div>
      </div>

      {joinError && <ErrorBox message={joinError} />}

      <button type="button" onClick={handleJoin} disabled={isJoining || isFull} className={primaryButton}>
        {isJoining && <Spinner />}
        {isFull ? t("teamFull") : t("join", { team: preview.team_name })}
      </button>
      {createInstead}
    </div>
  );
}

export function TeamStep() {
  const invite = useSearchParams().get("invite");
  return invite ? <InviteJoin invite={invite} /> : <CreateTeamForm />;
}
