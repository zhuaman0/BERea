"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { readingAdminApi, readingAuthApi } from "@berea/api";
import { isApiError } from "@/features/auth/utils";
import { useReadingAuthStore } from "@/features/reading/store/useReadingAuthStore";
import type { ReadingTeamSummary } from "@berea/api";

export default function ReadingAdminTeamsPage() {
  const [teams, setTeams] = useState<ReadingTeamSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    readingAuthApi
      .listTeams()
      .then(setTeams)
      .catch((err) => setLoadError(isApiError(err) ? err.detail : "Couldn't load teams."))
      .finally(() => setIsLoading(false));
  }, []);

  async function handleDelete(team: ReadingTeamSummary) {
    if (deletingId) return;
    if (!window.confirm(
      `Delete team "${team.name}"? Its payment record and invite link will be removed. All ${team.member_count} player accounts will be kept and can join another team. This can't be undone.`,
    )) return;
    setDeleteError(null);
    setDeletingId(team.id);
    try {
      await readingAdminApi.deleteTeam(team.id);
      setTeams((prev) => prev.filter((item) => item.id !== team.id));
      const { user, updateUser } = useReadingAuthStore.getState();
      if (user?.team_name === team.name) {
        updateUser({ team_name: null, payment_status: null, is_captain: false });
      }
    } catch (err) {
      setDeleteError(isApiError(err) ? err.detail : "Couldn't delete that team.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="w-full px-4 py-6 sm:px-8 sm:py-10 lg:px-12">
      <h1 className="font-display text-2xl font-semibold text-[var(--rd-text)]">Teams</h1>
      <p className="mt-1 text-sm text-[var(--rd-text-muted)]">
        Every registered team, pulled live from the database.
      </p>

      {deleteError && (
        <p role="alert" className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
          {deleteError}
        </p>
      )}

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
                <th className="px-6 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--rd-border)]">
              {teams.map((team, i) => (
                <tr key={team.id}>
                  <td className="px-6 py-4 text-[var(--rd-text-muted)]">#{i + 1}</td>
                  <td className="px-6 py-4 font-medium text-[var(--rd-text)]">{team.name}</td>
                  <td className="px-6 py-4 text-[var(--rd-text-muted)]">{team.member_count}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(team)}
                      disabled={deletingId !== null}
                      aria-label={`Delete team ${team.name}`}
                      className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg border border-red-500/30 px-3 py-2 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Trash2 size={14} aria-hidden="true" />
                      {deletingId === team.id ? "Deleting…" : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
