"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Pencil, UserPlus } from "lucide-react";
import { isApiError } from "@/features/auth/utils";
import { cn } from "@/shared/lib/utils";
import type { ReadingTeam } from "@/features/reading/authTypes";
import { KitPattern } from "./KitPattern";
import { TeamJersey } from "./TeamJersey";
import { initials, type TeamKit } from "./teamKit";

const EASE = [0.16, 1, 0.3, 1] as const;

interface TeamHeroProps {
  team:          ReadingTeam;
  kit:           TeamKit;
  roundLabel:    string | null;
  onRename:      (name: string) => Promise<void>;
  onAddStudents: () => void;
}

export function TeamHero({ team, kit, roundLabel, onRename, onAddStudents }: TeamHeroProps) {
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
      className={cn("relative overflow-hidden rounded-[28px] border bg-[var(--rd-panel)]", kit.border)}
    >
      <KitPattern kit={kit} className="inset-y-0 right-0 h-full w-2/3 [mask-image:linear-gradient(to_left,black,transparent)]" />
      <div className={cn("pointer-events-none absolute -left-24 -top-32 h-96 w-96 rounded-full blur-3xl", kit.glow)} />
      <div className={cn("pointer-events-none absolute -bottom-40 right-10 h-80 w-80 rounded-full opacity-60 blur-3xl", kit.glow)} />

      <div className="relative flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:gap-8 sm:p-8 lg:gap-12 lg:p-10">
        <motion.div
          initial={{ opacity: 0, rotate: -10, scale: 0.85 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
          className="w-36 shrink-0 lg:w-48"
        >
          <motion.div
            animate={{ y: [0, -8, 0], rotate: [-1.5, 1.5, -1.5] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <TeamJersey kit={kit} monogram={initials(team.name)} className="w-full drop-shadow-2xl" />
          </motion.div>
        </motion.div>

        <div className="min-w-0 flex-1">
          <motion.p
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: EASE }}
            className={cn("text-[11px] font-semibold uppercase tracking-[0.28em]", kit.text)}
          >
            Your team{roundLabel ? ` · ${roundLabel}` : ""}
          </motion.p>

          {isRenaming ? (
            <form onSubmit={handleRenameSubmit} className="mt-3 flex flex-wrap items-center gap-2">
              <input
                autoFocus
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                aria-label="Team name"
                className="h-14 min-w-0 max-w-md flex-1 rounded-xl border border-[var(--rd-border)] bg-[var(--rd-ink)] px-4 font-display text-2xl font-semibold text-[var(--rd-text)] focus:border-[var(--rd-accent-from)] focus:outline-none"
              />
              <button
                type="submit"
                disabled={isSaving}
                className="rd-accent-gradient h-11 rounded-lg px-5 text-sm font-semibold text-black/85 disabled:opacity-50"
              >
                Save
              </button>
              <button
                type="button"
                onClick={cancelRename}
                className="h-11 rounded-lg border border-[var(--rd-border)] px-5 text-sm text-[var(--rd-text)]"
              >
                Cancel
              </button>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25, ease: EASE }}
              className="group mt-2 flex items-start gap-3"
            >
              <h1 className="break-words font-display text-4xl font-semibold tracking-tight text-[var(--rd-text)] sm:text-5xl lg:text-6xl">
                {team.name}
              </h1>
              <button
                onClick={() => { setDraftName(team.name); setIsRenaming(true); }}
                aria-label="Rename team"
                className="mt-2 rounded-lg p-2 text-[var(--rd-text-muted)] opacity-60 transition-all hover:bg-white/[0.05] hover:text-[var(--rd-text)] group-hover:opacity-100"
              >
                <Pencil size={16} />
              </button>
            </motion.div>
          )}
          {renameError && <p className="mt-2 text-sm text-red-400">{renameError}</p>}

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35, ease: EASE }}
            className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-4"
          >
            <div className="flex items-center">
              {team.members.map((member, i) => (
                <motion.span
                  key={member.id}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.45 + i * 0.08, ease: EASE }}
                  title={member.full_name}
                  className={cn(
                    "-ml-1.5 flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-black/80 ring-[3px] ring-[var(--rd-panel)] first:ml-0",
                    kit.band
                  )}
                >
                  {initials(member.full_name)}
                </motion.span>
              ))}
              {Array.from({ length: openSpots }).map((_, i) => (
                <span
                  key={`open-${i}`}
                  className="-ml-1.5 flex h-10 w-10 items-center justify-center rounded-full border border-dashed border-[var(--rd-text-muted)]/50 bg-[var(--rd-panel)] ring-[3px] ring-[var(--rd-panel)] first:ml-0"
                />
              ))}
            </div>
            <p className="text-sm text-[var(--rd-text-muted)]">
              <span className="font-semibold text-[var(--rd-text)]">{team.members.length}/{team.max_members}</span> players
              {openSpots > 0 ? ` · ${openSpots} ${openSpots === 1 ? "spot" : "spots"} open` : " · full roster"}
            </p>
            {openSpots > 0 && (
              <button
                onClick={onAddStudents}
                className="rd-accent-gradient inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-black/85 shadow-[0_8px_30px_-8px_var(--rd-accent-from)] transition-transform hover:-translate-y-0.5"
              >
                <UserPlus size={15} />
                Add students
              </button>
            )}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.4, ease: EASE }}
          className="hidden shrink-0 flex-col items-end text-right lg:flex"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--rd-text-muted)]">Place</p>
          <p className="font-display text-[112px] font-bold leading-none tracking-tighter text-[var(--rd-text)]">
            <span className={kit.text}>#</span>
            {team.place}
          </p>
          <p className="mt-1 text-sm text-[var(--rd-text-muted)]">
            of {team.teams_total} {team.teams_total === 1 ? "team" : "teams"}
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
}
