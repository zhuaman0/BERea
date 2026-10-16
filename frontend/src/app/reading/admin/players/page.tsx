"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { readingAdminApi } from "@berea/api";
import type { ReadingAdminUser } from "@berea/api";
import { initials } from "@berea/core";
import { isApiError } from "@/features/auth/utils";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function matchesQuery(user: ReadingAdminUser, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return [user.full_name, user.email, user.team_name ?? ""].some((field) => field.toLowerCase().includes(needle));
}

interface SummaryTileProps {
  label: string;
  value: number;
}

function SummaryTile({ label, value }: SummaryTileProps) {
  return (
    <div className="rounded-2xl border border-[var(--rd-border)] bg-[var(--rd-panel)] px-5 py-4">
      <p className="font-display text-3xl font-semibold text-[var(--rd-text)]">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[var(--rd-text-muted)]">{label}</p>
    </div>
  );
}

export default function ReadingAdminPlayersPage() {
  const [users, setUsers] = useState<ReadingAdminUser[]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    readingAdminApi
      .listUsers()
      .then(setUsers)
      .catch((err) => setLoadError(isApiError(err) ? err.detail : "Couldn't load players."))
      .finally(() => setIsLoading(false));
  }, []);

  const visibleUsers = users.filter((user) => matchesQuery(user, query));
  const withTeam = users.filter((user) => user.team_name).length;

  return (
    <div className="mx-auto w-full max-w-[1600px] px-8 py-10 lg:px-12">
      <h1 className="font-display text-2xl font-semibold text-[var(--rd-text)]">Players</h1>
      <p className="mt-1 text-sm text-[var(--rd-text-muted)]">
        Everyone who has created an account, newest first.
      </p>

      {isLoading ? (
        <p className="mt-6 text-sm text-[var(--rd-text-muted)]">Loading players…</p>
      ) : loadError ? (
        <p className="mt-6 text-sm text-[var(--rd-text-muted)]">{loadError}</p>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <SummaryTile label="Accounts" value={users.length} />
            <SummaryTile label="In a team" value={withTeam} />
            <SummaryTile label="Without a team" value={users.length - withTeam} />
          </div>

          <label className="mt-6 flex h-11 max-w-md items-center gap-2.5 rounded-xl border border-[var(--rd-border)] bg-[var(--rd-panel)] px-4 focus-within:border-[var(--rd-accent-from)]">
            <Search size={15} className="shrink-0 text-[var(--rd-text-muted)]" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, email or team"
              aria-label="Search players"
              className="h-full w-full bg-transparent text-sm text-[var(--rd-text)] placeholder:text-[var(--rd-text-muted)] focus:outline-none"
            />
          </label>

          {visibleUsers.length === 0 ? (
            <p className="mt-6 text-sm text-[var(--rd-text-muted)]">
              {users.length === 0 ? "Nobody has signed up yet." : "No players match that search."}
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-2xl border border-[var(--rd-border)] bg-[var(--rd-panel)]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--rd-border)] text-left text-xs uppercase tracking-[0.1em] text-[var(--rd-text-muted)]">
                    <th className="px-6 py-4 font-medium">Player</th>
                    <th className="px-6 py-4 font-medium">Team</th>
                    <th className="px-6 py-4 font-medium">Streak</th>
                    <th className="px-6 py-4 font-medium">Last active</th>
                    <th className="px-6 py-4 font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--rd-border)]">
                  {visibleUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="rd-accent-gradient flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-black/80">
                            {initials(user.full_name)}
                          </span>
                          <div className="min-w-0">
                            <p className="flex items-center gap-2 font-medium text-[var(--rd-text)]">
                              {user.full_name}
                              {user.is_admin && (
                                <span className="rounded-full border border-[var(--rd-accent-from)]/40 px-1.5 py-px text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--rd-accent-from)]">
                                  Admin
                                </span>
                              )}
                              {user.is_tester && (
                                <span className="rounded-full border border-sky-400/40 px-1.5 py-px text-[10px] font-semibold uppercase tracking-[0.1em] text-sky-300">
                                  Tester
                                </span>
                              )}
                            </p>
                            <p className="mt-0.5 text-xs text-[var(--rd-text-muted)]">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[var(--rd-text)]">
                        {user.team_name ?? <span className="text-[var(--rd-text-muted)]">No team yet</span>}
                      </td>
                      <td className="px-6 py-4 text-[var(--rd-text-muted)]">
                        {user.current_streak} {user.current_streak === 1 ? "day" : "days"}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-[var(--rd-text-muted)]">
                        {user.last_active_date ? formatDate(user.last_active_date) : "—"}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-[var(--rd-text-muted)]">
                        {formatDate(user.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
