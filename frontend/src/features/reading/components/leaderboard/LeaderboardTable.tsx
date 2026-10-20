import type { MutableRefObject } from "react";
import { Search, Users, X } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import type { ReadingTeamSummary } from "@berea/api";
import { TeamBook } from "@/features/reading/components/team/TeamBook";

interface LeaderboardTableProps {
  teams: ReadingTeamSummary[];
  totalTeams: number;
  rankById: Record<string, number>;
  query: string;
  myTeamName: string | null;
  flashId: string | null;
  rowRefs: MutableRefObject<Record<string, HTMLTableRowElement | null>>;
  onQueryChange: (query: string) => void;
  onClearQuery: () => void;
}

function RankMark({ rank }: { rank: number }) {
  const treatment = rank === 1
    ? "border-[#f5b942]/40 bg-[#f5b942]/10 text-[#ffd978]"
    : rank === 2
      ? "border-[#b9c3d3]/30 bg-[#b9c3d3]/10 text-[#dbe2ec]"
      : rank === 3
        ? "border-[#c47b52]/35 bg-[#c47b52]/10 text-[#e8a67f]"
        : "border-white/[0.07] bg-white/[0.025] text-[var(--rd-text-muted)]";

  return <span className={`inline-flex h-8 min-w-8 items-center justify-center rounded-lg border px-1.5 font-mono text-xs font-medium tabular-nums ${treatment}`}>{rank}</span>;
}

export function LeaderboardTable({
  teams,
  totalTeams,
  rankById,
  query,
  myTeamName,
  flashId,
  rowRefs,
  onQueryChange,
  onClearQuery,
}: LeaderboardTableProps) {
  const t = useTranslations("reading.leaderboard.table");
  const format = useFormatter();

  return (
    <section className="mt-10 overflow-hidden rounded-[24px] border border-white/[0.08] bg-[var(--rd-panel)] shadow-[0_18px_60px_rgba(0,0,0,0.18)]" aria-labelledby="standings-title">
      <div className="flex flex-col gap-4 border-b border-white/[0.07] px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--rd-accent-from)]">{t("eyebrow")}</p>
          <h2 id="standings-title" className="font-display mt-1 text-xl font-semibold text-[var(--rd-text)] sm:text-2xl">{t("title")}</h2>
        </div>

        <label className="relative block w-full sm:w-72">
          <span className="sr-only">{t("searchLabel")}</span>
          <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--rd-text-muted)]" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={t("searchPlaceholder")}
            className="h-10 w-full rounded-xl border border-white/[0.08] bg-[var(--rd-ink)] py-2 pl-10 pr-10 text-sm text-[var(--rd-text)] outline-none transition placeholder:text-[var(--rd-text-muted)]/60 focus:border-[var(--rd-accent-from)]/55 focus:ring-2 focus:ring-[var(--rd-accent-from)]/10"
          />
          {query && (
            <button
              type="button"
              onClick={onClearQuery}
              aria-label={t("clearSearchLabel")}
              className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-[var(--rd-text-muted)] transition hover:bg-white/[0.06] hover:text-[var(--rd-text)]"
            >
              <X size={14} aria-hidden="true" />
            </button>
          )}
        </label>
      </div>

      {teams.length === 0 ? (
        <div className="px-6 py-14 text-center">
          <p className="font-display text-base font-semibold text-[var(--rd-text)]">{t("noMatchTitle")}</p>
          <p className="mt-1 text-sm text-[var(--rd-text-muted)]">{t("noMatchBody")}</p>
          <button type="button" onClick={onClearQuery} className="mt-4 text-xs font-semibold text-[var(--rd-accent-to)] underline-offset-4 hover:underline">{t("clearSearch")}</button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <caption className="sr-only">{t("caption")}</caption>
            <thead>
              <tr className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--rd-text-muted)]">
                <th scope="col" className="w-16 px-4 py-3.5 font-semibold sm:w-24 sm:px-6">{t("columns.rank")}</th>
                <th scope="col" className="px-2 py-3.5 font-semibold sm:px-4">{t("columns.team")}</th>
                <th scope="col" className="hidden px-4 py-3.5 text-center font-semibold sm:table-cell">{t("columns.readers")}</th>
                <th scope="col" className="px-4 py-3.5 text-right font-semibold sm:px-6">{t("columns.points")}</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team) => {
                const rank = rankById[team.id];
                const isMine = team.name === myTeamName;
                const isFlashing = flashId === team.id;

                return (
                  <tr
                    key={team.id}
                    ref={(element) => { rowRefs.current[team.id] = element; }}
                    className={`group border-t border-white/[0.06] transition-colors duration-300 ${
                      isFlashing
                        ? "bg-[var(--rd-accent-from)]/20"
                        : isMine
                          ? "bg-[var(--rd-accent-from)]/[0.07]"
                          : "hover:bg-white/[0.025]"
                    }`}
                  >
                    <td className="px-4 py-3 sm:px-6"><RankMark rank={rank} /></td>
                    <th scope="row" className="px-2 py-3 font-normal sm:px-4">
                      <div className="flex min-w-0 items-center gap-2.5 sm:gap-3.5">
                        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-black/20 sm:h-14 sm:w-14">
                          <TeamBook cover={team.cover} teamName={team.name} compact className="w-11 sm:w-12" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`block max-w-[36vw] truncate text-sm sm:max-w-none ${isMine ? "font-semibold text-[var(--rd-text)]" : "font-medium text-[var(--rd-text)]"}`}>{team.name}</span>
                            {isMine && <span className="hidden rounded-full bg-[var(--rd-accent-from)]/15 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[var(--rd-accent-to)] min-[430px]:inline">{t("yourTeam")}</span>}
                          </div>
                          <span className="mt-1 flex items-center gap-1 text-[10px] text-[var(--rd-text-muted)] sm:hidden">
                            <Users size={10} aria-hidden="true" />{t("readers", { count: team.member_count })}
                          </span>
                        </div>
                      </div>
                    </th>
                    <td className="hidden px-4 py-3 text-center sm:table-cell">
                      <span className="inline-flex items-center gap-1.5 text-xs tabular-nums text-[var(--rd-text-muted)]"><Users size={13} aria-hidden="true" />{team.member_count}</span>
                    </td>
                    <td className="px-4 py-3 text-right sm:px-6">
                      <span className="font-display text-base font-semibold tabular-nums text-[var(--rd-text)] sm:text-lg">{format.number(team.points)}</span>
                      <span className="ml-1 hidden text-[9px] font-semibold uppercase tracking-wider text-[var(--rd-text-muted)] min-[430px]:inline">{t("ptsShort")}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between gap-4 border-t border-white/[0.07] px-4 py-3 text-[10px] uppercase tracking-[0.14em] text-[var(--rd-text-muted)] sm:px-6">
        <span>{query ? t("filteredCount", { shown: teams.length, count: totalTeams }) : t("totalCount", { count: totalTeams })}</span>
        <span className="hidden sm:inline">{t("liveData")}</span>
      </div>
    </section>
  );
}
