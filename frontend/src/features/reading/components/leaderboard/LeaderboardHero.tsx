import { ArrowDown, Sparkles, Trophy, Users } from "lucide-react";
import type { ReadingTeamSummary } from "@berea/api";

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
    <header className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-[var(--rd-panel)] px-5 py-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:px-8 sm:py-8 lg:px-10 lg:py-10">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 9% 10%, rgba(255,107,44,.28), transparent 28%), radial-gradient(circle at 92% 0%, rgba(255,194,77,.13), transparent 25%)",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
        aria-hidden="true"
      />

      <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--rd-accent-from)]/25 bg-[var(--rd-accent-from)]/[0.08] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--rd-accent-to)]">
            <Sparkles size={12} aria-hidden="true" />
            Season standings
          </div>
          <h1 className="font-display mt-5 text-[clamp(2.4rem,7vw,4.75rem)] font-semibold leading-[0.92] tracking-[-0.055em] text-[var(--rd-text)]">
            The race to the top
            <span className="block bg-gradient-to-r from-[var(--rd-accent-from)] to-[var(--rd-accent-to)] bg-clip-text text-transparent">
              starts here.
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-6 text-[var(--rd-text-muted)] sm:text-[15px]">
            Every quiz point moves your team forward. If scores are tied, roster size decides who takes the lead.
          </p>
        </div>

        <div className="flex flex-col gap-4 lg:items-end">
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
        </div>
      </div>

      <div className="relative mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/[0.06] pt-4 text-[11px] text-[var(--rd-text-muted)] sm:mt-10">
        <span className="inline-flex items-center gap-1.5"><Trophy size={13} className="text-[var(--rd-accent-from)]" aria-hidden="true" /> Ranked by quiz points</span>
        <span className="inline-flex items-center gap-1.5"><Users size={13} aria-hidden="true" /> Roster size breaks a tie</span>
      </div>
    </header>
  );
}
