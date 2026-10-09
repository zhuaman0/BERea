"use client";

import { useEffect, useRef, useState } from "react";
import { Crown, Medal, Trophy, Users } from "lucide-react";
import { readingAuthApi } from "@/features/reading/authApi";
import { readingSettingsApi } from "@/features/reading/settingsApi";
import { isApiError } from "@/features/auth/utils";
import { useReadingAuthStore } from "@/features/reading/store/useReadingAuthStore";
import type { ReadingTeamSummary } from "@/features/reading/authTypes";

const MEDAL_STYLE: Record<number, { icon: typeof Trophy; ring: string; iconColor: string }> = {
  1: { icon: Crown,  ring: "ring-2 ring-[var(--rd-accent-from)]", iconColor: "text-[var(--rd-accent-from)]" },
  2: { icon: Trophy, ring: "ring-1 ring-[var(--rd-border)]",      iconColor: "text-[var(--rd-text-muted)]" },
  3: { icon: Medal,  ring: "ring-1 ring-[var(--rd-border)]",      iconColor: "text-[var(--rd-text-muted)]" },
};

const AVATAR_HUES = [18, 265, 200, 330, 140, 40];

function avatarColor(name: string): string {
  const sum = [...name].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const hue = AVATAR_HUES[sum % AVATAR_HUES.length];
  return `hsl(${hue}, 55%, 42%)`;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export default function ReadingLeaderboardPage() {
  const myTeamName = useReadingAuthStore((s) => s.user?.team_name ?? null);

  const [teams, setTeams] = useState<ReadingTeamSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [leaderboardEnabled, setLeaderboardEnabled] = useState(true);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);

  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});
  const [flashId, setFlashId] = useState<string | null>(null);

  useEffect(() => {
    readingSettingsApi
      .get()
      .then((s) => setLeaderboardEnabled(s.leaderboard_enabled))
      .catch(() => { /* keep showing the leaderboard if settings fail to load */ })
      .finally(() => setIsCheckingAccess(false));
  }, []);

  useEffect(() => {
    readingAuthApi
      .listTeams()
      .then(setTeams)
      .catch((err) => setLoadError(isApiError(err) ? err.detail : "Couldn't load the leaderboard."))
      .finally(() => setIsLoading(false));
  }, []);

  const podium = teams.slice(0, 3);
  const rest = teams.slice(3);
  const myTeam = teams.find((t) => t.name === myTeamName);

  function handleShowMyPlace() {
    if (!myTeam) return;
    const el = rowRefs.current[myTeam.id];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    setFlashId(myTeam.id);
    window.setTimeout(() => setFlashId(null), 1600);
  }

  if (!isCheckingAccess && !leaderboardEnabled) {
    return (
      <div className="mx-auto w-full max-w-[1600px] px-8 py-10 lg:px-12">
        <h1 className="font-display text-3xl font-semibold text-[var(--rd-text)]">Leaderboard</h1>
        <div className="mt-6 rounded-2xl border border-dashed border-[var(--rd-border)] p-10 text-center">
          <p className="text-sm text-[var(--rd-text-muted)]">
            The leaderboard is currently unavailable. Check back later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] px-8 py-10 lg:px-12">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-[var(--rd-text)]">Leaderboard</h1>
          <p className="mt-1.5 text-sm text-[var(--rd-text-muted)]">
            Every team that has registered, pulled live from the database.
          </p>
        </div>
        {myTeam && rest.some((t) => t.id === myTeam.id) && (
          <button
            onClick={handleShowMyPlace}
            className="shrink-0 rounded-lg border border-[var(--rd-border)] px-4 py-2 text-sm font-medium text-[var(--rd-text)] transition-colors hover:border-[var(--rd-accent-from)]"
          >
            Show my place
          </button>
        )}
      </div>

      <div className="mt-4 rounded-xl border border-[var(--rd-border)] bg-[var(--rd-panel)] px-4 py-3 text-xs leading-relaxed text-[var(--rd-text-muted)]">
        Ranked by roster size for now, since quiz and reading points aren&apos;t tracked yet — a team
        moves up the moment a new student joins it. Point-based standings will replace this once
        quiz nights and book progress start counting toward the league.
      </div>

      {isLoading ? (
        <p className="mt-8 text-sm text-[var(--rd-text-muted)]">Loading the leaderboard…</p>
      ) : loadError ? (
        <p className="mt-8 text-sm text-[var(--rd-text-muted)]">{loadError}</p>
      ) : teams.length === 0 ? (
        <p className="mt-8 text-sm text-[var(--rd-text-muted)]">No teams have registered yet.</p>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {podium.map((team, i) => {
              const place = i + 1;
              const medal = MEDAL_STYLE[place];
              const MedalIcon = medal.icon;
              const isMine = team.name === myTeamName;
              return (
                <div
                  key={team.id}
                  className={`rounded-2xl border border-[var(--rd-border)] bg-[var(--rd-panel)] p-6 ${medal.ring}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                        style={{ backgroundColor: avatarColor(team.name) }}
                      >
                        {initials(team.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-display text-base font-semibold text-[var(--rd-text)]">
                          {team.name}
                        </p>
                        {isMine && (
                          <span className="rounded-full bg-[var(--rd-border)] px-2 py-0.5 text-[10px] text-[var(--rd-text-muted)]">
                            your team
                          </span>
                        )}
                      </div>
                    </div>
                    <MedalIcon size={22} className={medal.iconColor} />
                  </div>

                  <div className="mt-5 flex items-baseline justify-between border-t border-[var(--rd-border)] pt-4">
                    <span className="flex items-center gap-1.5 text-sm text-[var(--rd-text-muted)]">
                      <Users size={14} /> Players
                    </span>
                    <span className="font-display text-2xl font-semibold text-[var(--rd-text)]">
                      {team.member_count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {rest.length > 0 && (
            <div className="mt-6 overflow-x-auto rounded-2xl border border-[var(--rd-border)] bg-[var(--rd-panel)]">
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--rd-border)] text-xs uppercase tracking-[0.1em] text-[var(--rd-text-muted)]">
                    <th className="px-5 py-4 font-medium">Place</th>
                    <th className="px-5 py-4 font-medium">Team</th>
                    <th className="px-5 py-4 text-right font-medium">Players</th>
                  </tr>
                </thead>
                <tbody>
                  {rest.map((team, i) => {
                    const isMine = team.name === myTeamName;
                    return (
                      <tr
                        key={team.id}
                        ref={(el) => { rowRefs.current[team.id] = el; }}
                        className={`border-b border-[var(--rd-border)] transition-colors last:border-0 ${
                          isMine ? "bg-[var(--rd-accent-from)]/[0.07]" : ""
                        } ${flashId === team.id ? "bg-[var(--rd-accent-from)]/20" : ""}`}
                      >
                        <td className="px-5 py-4 text-[var(--rd-text-muted)]">{i + 4}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                              style={{ backgroundColor: avatarColor(team.name) }}
                            >
                              {initials(team.name)}
                            </div>
                            <span className={isMine ? "font-semibold text-[var(--rd-text)]" : "text-[var(--rd-text)]"}>
                              {team.name}
                            </span>
                            {isMine && (
                              <span className="rounded-full bg-[var(--rd-border)] px-2 py-0.5 text-[10px] text-[var(--rd-text-muted)]">
                                you
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right font-semibold text-[var(--rd-text)]">
                          {team.member_count}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
