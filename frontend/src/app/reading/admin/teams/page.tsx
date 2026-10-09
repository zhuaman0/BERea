"use client";

import { useEffect, useState } from "react";
import { readingAuthApi } from "@/features/reading/authApi";
import { isApiError } from "@/features/auth/utils";
import type { ReadingTeamSummary } from "@/features/reading/authTypes";

export default function ReadingAdminTeamsPage() {
  const [teams, setTeams] = useState<ReadingTeamSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    readingAuthApi
      .listTeams()
      .then(setTeams)
      .catch((err) => setLoadError(isApiError(err) ? err.detail : "Couldn't load teams."))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="mx-auto w-full max-w-[1600px] px-8 py-10 lg:px-12">
      <h1 className="font-display text-2xl font-semibold text-[var(--rd-text)]">Teams</h1>
      <p className="mt-1 text-sm text-[var(--rd-text-muted)]">
        Every registered team, pulled live from the database.
      </p>

      {isLoading ? (
        <p className="mt-6 text-sm text-[var(--rd-text-muted)]">Loading teams…</p>
      ) : loadError ? (
        <p className="mt-6 text-sm text-[var(--rd-text-muted)]">{loadError}</p>
      ) : teams.length === 0 ? (
        <p className="mt-6 text-sm text-[var(--rd-text-muted)]">No teams have registered yet.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-[var(--rd-border)] bg-[var(--rd-panel)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--rd-border)] text-left text-xs uppercase tracking-[0.1em] text-[var(--rd-text-muted)]">
                <th className="px-6 py-4 font-medium">Place</th>
                <th className="px-6 py-4 font-medium">Team</th>
                <th className="px-6 py-4 font-medium">Players</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--rd-border)]">
              {teams.map((team, i) => (
                <tr key={team.id}>
                  <td className="px-6 py-4 text-[var(--rd-text-muted)]">#{i + 1}</td>
                  <td className="px-6 py-4 font-medium text-[var(--rd-text)]">{team.name}</td>
                  <td className="px-6 py-4 text-[var(--rd-text-muted)]">{team.member_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
