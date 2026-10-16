import { Crown, Medal, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReadingTeamSummary } from "@berea/api";
import { CoverShowcase } from "@/features/reading/components/team/CoverShowcase";

interface LeaderboardPodiumProps {
  teams: ReadingTeamSummary[];
  myTeamName: string | null;
}

interface PlaceStyle {
  label: string;
  icon: LucideIcon;
  order: string;
  card: string;
  badge: string;
  accent: string;
  bookWidth: string;
}

const PLACE_STYLES: PlaceStyle[] = [
  {
    label: "Champion",
    icon: Crown,
    order: "sm:order-2",
    card: "sm:min-h-[390px] border-[#f5b942]/35 bg-[radial-gradient(circle_at_50%_0%,rgba(245,185,66,0.18),transparent_45%),var(--rd-panel)] shadow-[0_24px_70px_rgba(245,145,42,0.11)]",
    badge: "border-[#f5b942]/45 bg-[#f5b942]/10 text-[#ffd978]",
    accent: "bg-gradient-to-r from-[#e88a24] via-[#ffd978] to-[#e88a24]",
    bookWidth: "w-32 sm:w-36",
  },
  {
    label: "Runner-up",
    icon: Trophy,
    order: "sm:order-1",
    card: "sm:min-h-[350px] border-[#b9c3d3]/25 bg-[radial-gradient(circle_at_50%_0%,rgba(185,195,211,0.13),transparent_42%),var(--rd-panel)]",
    badge: "border-[#b9c3d3]/30 bg-[#b9c3d3]/10 text-[#dbe2ec]",
    accent: "bg-gradient-to-r from-[#748094] via-[#dbe2ec] to-[#748094]",
    bookWidth: "w-28 sm:w-30",
  },
  {
    label: "Third place",
    icon: Medal,
    order: "sm:order-3",
    card: "sm:min-h-[330px] border-[#c47b52]/25 bg-[radial-gradient(circle_at_50%_0%,rgba(196,123,82,0.13),transparent_42%),var(--rd-panel)]",
    badge: "border-[#c47b52]/35 bg-[#c47b52]/10 text-[#e8a67f]",
    accent: "bg-gradient-to-r from-[#8f4f32] via-[#dc9369] to-[#8f4f32]",
    bookWidth: "w-28",
  },
];

export function LeaderboardPodium({ teams, myTeamName }: LeaderboardPodiumProps) {
  const gridWidth = teams.length === 1
    ? "sm:mx-auto sm:max-w-md sm:grid-cols-1"
    : teams.length === 2
      ? "sm:mx-auto sm:max-w-3xl sm:grid-cols-2"
      : "sm:grid-cols-3";

  return (
    <section className="mt-10" aria-labelledby="podium-title">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--rd-accent-from)]">Front runners</p>
          <h2 id="podium-title" className="font-display mt-1 text-2xl font-semibold tracking-tight text-[var(--rd-text)] sm:text-3xl">This season&apos;s podium</h2>
        </div>
        <p className="hidden max-w-xs text-right text-xs leading-5 text-[var(--rd-text-muted)] sm:block">Live standings update as points land.</p>
      </div>

      <div className={`grid grid-cols-1 items-end gap-4 ${gridWidth}`}>
        {teams.map((team, index) => {
          const place = index + 1;
          const style = PLACE_STYLES[index];
          const PlaceIcon = style.icon;
          const isMine = team.name === myTeamName;

          return (
            <article key={team.id} className={`group relative flex overflow-hidden rounded-[24px] border p-5 transition duration-300 hover:-translate-y-1 hover:border-white/20 ${style.order} ${style.card}`}>
              <div className={`absolute inset-x-8 top-0 h-px ${style.accent}`} aria-hidden="true" />
              <span className="pointer-events-none absolute -right-3 -top-8 font-display text-[120px] font-bold leading-none text-white/[0.025]" aria-hidden="true">{place}</span>

              <div className="relative flex w-full flex-col items-center text-center">
                <div className="flex w-full items-center justify-between">
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] ${style.badge}`}>
                    <PlaceIcon size={11} aria-hidden="true" />{style.label}
                  </span>
                  <span className="font-mono text-xs text-[var(--rd-text-muted)]">#{place}</span>
                </div>

                <CoverShowcase cover={team.cover} teamName={team.name} compact className={`-mb-3 mt-3 shrink-0 transition-transform duration-300 group-hover:scale-[1.03] ${style.bookWidth}`} />

                <div className="mt-auto w-full">
                  <div className="flex min-w-0 items-center justify-center gap-2">
                    <h3 className="font-display truncate text-lg font-semibold text-[var(--rd-text)]">{team.name}</h3>
                    {isMine && <span className="shrink-0 rounded-full bg-[var(--rd-accent-from)]/15 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[var(--rd-accent-to)]">You</span>}
                  </div>
                  <div className="mt-3 flex items-end justify-center gap-2 border-t border-white/[0.07] pt-3">
                    <strong className="font-display text-3xl font-semibold tabular-nums text-[var(--rd-text)]">{team.points.toLocaleString()}</strong>
                    <span className="pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--rd-text-muted)]">points</span>
                  </div>
                  <p className="mt-1 text-xs text-[var(--rd-text-muted)]">{team.member_count} {team.member_count === 1 ? "reader" : "readers"}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
