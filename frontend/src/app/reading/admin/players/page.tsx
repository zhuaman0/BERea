"use client";

import { useEffect, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { Search, Trash2, Users } from "lucide-react";
import { readingAdminApi } from "@berea/api";
import type { ReadingAdminUser } from "@berea/api";
import { initials } from "@berea/core";
import { isApiError } from "@/features/auth/utils";
import { useReadingAuthStore } from "@/features/reading/store/useReadingAuthStore";
import { ReadingPageHero } from "@/features/reading/components/layout/ReadingPageHero";
import { READING_PAGE_CONTAINER } from "@/features/reading/lib/pageContainer";

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
  const currentUserId = useReadingAuthStore((s) => s.user?.id);
  const [users, setUsers] = useState<ReadingAdminUser[]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const t = useTranslations("reading.admin.players");
  const tCommon = useTranslations("reading.admin.common");
  const format = useFormatter();

  function formatDate(iso: string): string {
    return format.dateTime(new Date(iso), { day: "numeric", month: "short", year: "numeric" });
  }

  useEffect(() => {
    readingAdminApi
      .listUsers()
      .then(setUsers)
      .catch((err) => setLoadError(isApiError(err) ? err.detail : t("loadError")))
      .finally(() => setIsLoading(false));
  }, [t]);

  async function handleDelete(user: ReadingAdminUser) {
    if (deletingId || user.id === currentUserId) return;
    if (!window.confirm(t("deleteConfirm", { name: user.full_name, email: user.email }))) return;
    setDeleteError(null);
    setDeletingId(user.id);
    try {
      await readingAdminApi.deleteUser(user.id);
      setUsers((prev) => prev.filter((player) => player.id !== user.id));
    } catch (err) {
      setDeleteError(isApiError(err) ? err.detail : t("deleteError"));
    } finally {
      setDeletingId(null);
    }
  }

  const visibleUsers = users.filter((user) => matchesQuery(user, query));
  const withTeam = users.filter((user) => user.team_name).length;

  return (
    <div className={READING_PAGE_CONTAINER}>
      <ReadingPageHero eyebrow={tCommon("eyebrow")} eyebrowIcon={Users} title={t("title")} description={t("description")} />

      {deleteError && (
        <p role="alert" className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
          {deleteError}
        </p>
      )}

      {isLoading ? (
        <p className="mt-6 text-sm text-[var(--rd-text-muted)]">{t("loading")}</p>
      ) : loadError ? (
        <p className="mt-6 text-sm text-[var(--rd-text-muted)]">{loadError}</p>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <SummaryTile label={t("summary.accounts")} value={users.length} />
            <SummaryTile label={t("summary.inTeam")} value={withTeam} />
            <SummaryTile label={t("summary.withoutTeam")} value={users.length - withTeam} />
          </div>

          <label className="mt-6 flex h-11 max-w-md items-center gap-2.5 rounded-xl border border-[var(--rd-border)] bg-[var(--rd-panel)] px-4 focus-within:border-[var(--rd-accent-from)]">
            <Search size={15} className="shrink-0 text-[var(--rd-text-muted)]" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("searchPlaceholder")}
              aria-label={t("searchAria")}
              className="h-full w-full bg-transparent text-sm text-[var(--rd-text)] placeholder:text-[var(--rd-text-muted)] focus:outline-none"
            />
          </label>

          {visibleUsers.length === 0 ? (
            <p className="mt-6 text-sm text-[var(--rd-text-muted)]">
              {users.length === 0 ? t("emptyAll") : t("emptySearch")}
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-2xl border border-[var(--rd-border)] bg-[var(--rd-panel)]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--rd-border)] text-left text-xs uppercase tracking-[0.1em] text-[var(--rd-text-muted)]">
                    <th className="px-6 py-4 font-medium">{t("columns.player")}</th>
                    <th className="px-6 py-4 font-medium">{t("columns.team")}</th>
                    <th className="px-6 py-4 font-medium">{t("columns.streak")}</th>
                    <th className="px-6 py-4 font-medium">{t("columns.lastActive")}</th>
                    <th className="px-6 py-4 font-medium">{t("columns.joined")}</th>
                    <th className="px-6 py-4 text-right font-medium">{tCommon("actions")}</th>
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
                                  {t("badges.admin")}
                                </span>
                              )}
                              {user.is_tester && (
                                <span className="rounded-full border border-sky-400/40 px-1.5 py-px text-[10px] font-semibold uppercase tracking-[0.1em] text-sky-300">
                                  {t("badges.tester")}
                                </span>
                              )}
                            </p>
                            <p className="mt-0.5 text-xs text-[var(--rd-text-muted)]">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[var(--rd-text)]">
                        {user.team_name ?? <span className="text-[var(--rd-text-muted)]">{t("noTeam")}</span>}
                      </td>
                      <td className="px-6 py-4 text-[var(--rd-text-muted)]">
                        {t("streakDays", { count: user.current_streak })}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-[var(--rd-text-muted)]">
                        {user.last_active_date ? formatDate(user.last_active_date) : "—"}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-[var(--rd-text-muted)]">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {user.id === currentUserId ? (
                          <span className="text-xs text-[var(--rd-text-muted)]">{t("yourAccount")}</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleDelete(user)}
                            disabled={deletingId !== null}
                            aria-label={t("deleteAria", { name: user.full_name, email: user.email })}
                            className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg border border-red-500/30 px-3 py-2 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Trash2 size={14} aria-hidden="true" />
                            {deletingId === user.id ? tCommon("deleting") : tCommon("delete")}
                          </button>
                        )}
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
