"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Paintbrush, Pencil, Plus } from "lucide-react";
import { isApiError } from "@/features/auth/utils";
import { cn } from "@/shared/lib/utils";
import type { ReadingTeam } from "@berea/api";
import { initials } from "@berea/core";
import type { TeamTheme } from "./teamTheme";

const EASE = [0.16, 1, 0.3, 1] as const;

interface TeamHeroProps {
  team:          ReadingTeam;
  theme:         TeamTheme;
  roundLabel:    string | null;
  onRename:      (name: string) => Promise<void>;
  onAddStudents: () => void;
  onDesignCover: () => void;
}

export function TeamHero({ team, theme, roundLabel, onRename, onAddStudents, onDesignCover }: TeamHeroProps) {
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
      setRenameError(isApiError(err) ? err.detail : "Couldn't rename your team.");
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
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE }}
      className="relative overflow-hidden rounded-[28px] border border-[var(--rd-border)] bg-[var(--rd-panel)]"
    >
      <div
        className={cn("pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full opacity-70 blur-3xl", theme.glow)}
        aria-hidden="true"
      />

      <button
        type="button"
        onClick={onDesignCover}
        title="Customize team cover"
        aria-label="Customize team cover"
        className="absolute right-4 top-4 z-10 rounded-lg p-2 text-[var(--rd-text-muted)] transition-colors hover:bg-white/[0.05] hover:text-[var(--rd-text)]"
      >
        <Paintbrush size={15} />
      </button>

      <div className="relative flex flex-col gap-8 p-6 sm:p-8 lg:flex-row lg:items-end lg:justify-between lg:p-10">
        <div className="min-w-0 flex-1">
          <p className={cn("text-[11px] font-semibold uppercase tracking-[0.28em]", theme.text)}>
            Your reading team{roundLabel ? ` · ${roundLabel}` : ""}
          </p>

          {isRenaming ? (
            <form onSubmit={handleRenameSubmit} className="mt-3 flex flex-wrap items-center gap-2">
              <input
                autoFocus
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                aria-label="Team name"
                className="h-12 min-w-0 max-w-md flex-1 rounded-xl border border-[var(--rd-border)] bg-[var(--rd-ink)] px-4 font-display text-xl font-semibold text-[var(--rd-text)] focus:border-[var(--rd-accent-from)] focus:outline-none"
              />
              <button
                type="submit"
                disabled={isSaving}
                className="rd-accent-gradient h-10 rounded-lg px-5 text-sm font-semibold text-black/85 disabled:opacity-50"
              >
                Save
              </button>
              <button
                type="button"
                onClick={cancelRename}
                className="h-10 rounded-lg border border-[var(--rd-border)] px-5 text-sm text-[var(--rd-text)]"
              >
                Cancel
              </button>
            </form>
          ) : (
            <div className="group mt-3 flex items-center gap-2">
              <h1 className="break-words font-display text-4xl font-semibold tracking-tight text-[var(--rd-text)] sm:text-5xl">
                {team.name}
              </h1>
              <button
                type="button"
                onClick={() => { setDraftName(team.name); setIsRenaming(true); }}
                aria-label="Rename team"
                className="rounded-lg p-2 text-[var(--rd-text-muted)] opacity-0 transition-opacity hover:bg-white/[0.05] hover:text-[var(--rd-text)] focus-visible:opacity-100 group-hover:opacity-100"
              >
                <Pencil size={15} />
              </button>
            </div>
          )}
          {renameError && <p className="mt-2 text-sm text-red-400">{renameError}</p>}

          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3">
            <div className="flex items-center">
              {team.members.map((member) => (
                <span
                  key={member.id}
                  title={member.full_name}
                  className={cn(
                    "-ml-2 flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-bold text-black/80 ring-[3px] ring-[var(--rd-panel)] first:ml-0",
                    theme.band
                  )}
                >
                  {initials(member.full_name)}
                </span>
              ))}
            </div>
            <p className="text-sm text-[var(--rd-text-muted)]">
              <span className="font-semibold text-[var(--rd-text)]">{team.members.length}</span>/{team.max_members} players
            </p>
            {openSpots > 0 && (
              <button
                type="button"
                onClick={onAddStudents}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--rd-accent-from)]/40 px-3 py-1.5 text-xs font-semibold text-[var(--rd-accent-from)] transition-colors hover:bg-[var(--rd-accent-from)]/10"
              >
                <Plus size={13} />
                Add {openSpots === 1 ? "the last player" : "players"}
              </button>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-baseline gap-3 lg:flex-col lg:items-end lg:gap-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--rd-text-muted)] lg:order-first">
            Place
          </p>
          <p className="font-display text-5xl font-bold leading-none tracking-tighter text-[var(--rd-text)] lg:text-7xl">
            <span className={theme.text}>#</span>
            {team.place}
          </p>
          <p className="text-sm text-[var(--rd-text-muted)]">
            of {team.teams_total} {team.teams_total === 1 ? "team" : "teams"}
          </p>
        </div>
      </div>
    </motion.section>
  );
}
