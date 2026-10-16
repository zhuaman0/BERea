import { ArrowDown, Sparkles, Trophy, Users } from "lucide-react";
import type { ReadingTeamSummary } from "@berea/api";
import { ReadingPageHero } from "../layout/ReadingPageHero";

interface LeaderboardHeroProps {
  teams: ReadingTeamSummary[];
  myTeam: ReadingTeamSummary | null;
  myRank: number | null;
  onShowMyPlace: () => void;
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="font-display text-xl font-semibold tabular-nums text-[var(--rd-text)] sm:text-2xl">
        {value.toLocaleString()}
      </p>
      <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--rd-text-muted)]">
        {label}
      </p>
    </div>
  );
}

export function LeaderboardHero({ teams, myTeam, myRank, onShowMyPlace }: LeaderboardHeroProps) {
  const readers = teams.reduce((total, team) => total + team.member_count, 0);
  const leadingScore = teams[0]?.points ?? 0;

  return (
    <ReadingPageHero
      eyebrow="Season standings"
      eyebrowIcon={Sparkles}
      title="The race to the top"
      accent="starts here."
      description="Every quiz point moves your team forward. If scores are tied, roster size decides who takes the lead."
      aside={
        <>
          {myTeam && myRank !== null && (
            <button
              type="button"
              onClick={onShowMyPlace}
              className="group flex w-full items-center justify-between gap-5 rounded-2xl border border-[var(--rd-accent-from)]/25 bg-black/20 px-4 py-3.5 text-left transition duration-200 hover:-translate-y-0.5 hover:border-[var(--rd-accent-from)]/55 hover:bg-black/30 sm:w-auto"
            >
              <span className="flex items-center gap-3">
                <span className="rd-accent-gradient flex h-10 w-10 items-center justify-center rounded-xl font-display text-sm font-bold text-black/80 shadow-[0_8px_24px_rgba(255,107,44,0.22)]">
                  #{myRank}
                </span>
                <span>
                  <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--rd-text-muted)]">Your team</span>
                  <span className="mt-0.5 block max-w-40 truncate text-sm font-semibold text-[var(--rd-text)]">{myTeam.name}</span>
                </span>
              </span>
              <span className="flex items-center gap-2 pl-2">
                <span className="font-mono text-sm font-medium tabular-nums text-[var(--rd-accent-to)]">{myTeam.points} pts</span>
                <ArrowDown size={15} className="text-[var(--rd-text-muted)] transition-transform group-hover:translate-y-0.5" aria-hidden="true" />
              </span>
            </button>
          )}

          <div className="grid w-full grid-cols-3 gap-5 border-t border-white/[0.08] pt-4 sm:gap-8 lg:w-auto lg:min-w-[360px]">
            <Stat label="Teams" value={teams.length} />
            <Stat label="Readers" value={readers} />
            <Stat label="Top score" value={leadingScore} />
          </div>
        </>
      }
      footer={
        <>
          <span className="inline-flex items-center gap-1.5"><Trophy size={13} className="text-[var(--rd-accent-from)]" aria-hidden="true" /> Ranked by quiz points</span>
          <span className="inline-flex items-center gap-1.5"><Users size={13} aria-hidden="true" /> Roster size breaks a tie</span>
        </>
      }
    />
  );
}
