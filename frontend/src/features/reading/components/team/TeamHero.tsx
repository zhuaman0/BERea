"use client";

import { useState } from "react";
import { Crown, Pencil, UserPlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { isApiError } from "@/features/auth/utils";
import type { ReadingTeam } from "@berea/api";

const actionButton =
  "inline-flex h-10 items-center gap-2 rounded-xl border border-[var(--rd-border)] px-4 text-[13px] font-medium text-[var(--rd-text)] transition-colors hover:border-[var(--rd-accent-from)]/60 hover:bg-[var(--rd-accent-from)]/[0.06] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rd-accent-from)]";

interface TeamHeroProps {
  team:          ReadingTeam;
  isCaptain:     boolean;
  captainName:   string | null;
  seasonStarted: boolean;
  onRename:      (name: string) => Promise<void>;
  onInvite:      () => void;
}

export function TeamHero({ team, isCaptain, captainName, seasonStarted, onRename, onInvite }: TeamHeroProps) {
  const t = useTranslations("reading.team");
  const [isRenaming, setIsRenaming] = useState(false);
  const [draftName, setDraftName] = useState(team.name);
  const [renameError, setRenameError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const openSpots = team.max_members - team.members.length;

  async function handleRenameSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!draftName.trim()) return;
    setRenameError(null);
    setIsSaving(true);
    try {
      await onRename(draftName.trim());
      setIsRenaming(false);
    } catch (err) {
      setRenameError(isApiError(err) ? err.detail : t("hero.renameError"));
    } finally {
      setIsSaving(false);
    }
  }

  function cancelRename() {
    setIsRenaming(false);
    setDraftName(team.name);
    setRenameError(null);
  }

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-[var(--rd-border)] bg-[var(--rd-panel)]">
      <div
        className="pointer-events-none absolute -left-24 -top-28 h-80 w-80 rounded-full bg-[var(--rd-accent-from)]/15 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative p-6 sm:p-8 lg:p-10">
        <div className="min-w-0 flex-1">
          {isRenaming ? (
            <form onSubmit={handleRenameSubmit} className="flex flex-wrap items-center gap-2">
              <input
                autoFocus
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                aria-label={t("hero.teamNameLabel")}
                maxLength={120}
                className="h-12 min-w-0 max-w-md flex-1 rounded-xl border border-[var(--rd-border)] bg-[var(--rd-ink)] px-4 font-display text-xl font-semibold text-[var(--rd-text)] focus:border-[var(--rd-accent-from)] focus:outline-none"
              />
              <button
                type="submit"
                disabled={isSaving}
                className="rd-accent-gradient h-10 rounded-lg px-5 text-sm font-semibold text-black/85 disabled:opacity-50"
              >
                {t("hero.saveName")}
              </button>
              <button
                type="button"
                onClick={cancelRename}
                className="h-10 rounded-lg border border-[var(--rd-border)] px-5 text-sm text-[var(--rd-text)]"
              >
                {t("hero.cancel")}
              </button>
            </form>
          ) : (
            <h1 className="break-words font-display text-4xl font-semibold tracking-tight text-[var(--rd-text)] sm:text-5xl">
              {team.name}
            </h1>
          )}
          {renameError && <p className="mt-2 text-sm text-red-400">{renameError}</p>}

          <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--rd-text-muted)]">
            {captainName && (
              <span className="inline-flex items-center gap-1.5">
                <Crown size={14} className="text-[var(--rd-accent-from)]" />
                {isCaptain ? t("hero.captainYou") : t("hero.captain", { name: captainName })}
              </span>
            )}
            <span>{t("playersCount", { count: team.members.length, max: team.max_members })}</span>
            {seasonStarted && <span>{t("place", { place: team.place, total: team.teams_total })}</span>}
          </p>

          {isCaptain ? (
            <div className="mt-6 flex flex-wrap gap-2.5">
              {openSpots > 0 && (
                <button
                  type="button"
                  onClick={onInvite}
                  className="rd-accent-gradient inline-flex h-10 items-center gap-2 rounded-xl px-4 text-[13px] font-semibold text-[#1a0e05] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rd-accent-from)]"
                >
                  <UserPlus size={15} />
                  {t("invitePlayers")}
                </button>
              )}
              {!isRenaming && (
                <button
                  type="button"
                  onClick={() => { setDraftName(team.name); setIsRenaming(true); }}
                  className={actionButton}
                >
                  <Pencil size={15} />
                  {t("hero.rename")}
                </button>
              )}
            </div>
          ) : (
            <p className="mt-6 text-[13px] text-[var(--rd-text-muted)]">
              {t("hero.captainManages")}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
