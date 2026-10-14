"use client";

import { useCallback, useEffect, useState } from "react";
import { MotionConfig } from "framer-motion";
import { BookOpen, Flame, Trophy } from "lucide-react";
import { StatStrip, type StatStripItem } from "@berea/ui-kit";
import { InvitePlayersModal } from "@/features/reading/components/team/InvitePlayersModal";
import { KickoffChecklist } from "@/features/reading/components/team/KickoffChecklist";
import { SeasonClock } from "@/features/reading/components/team/SeasonClock";
import { TeamHero } from "@/features/reading/components/team/TeamHero";
import { TeamRoster } from "@/features/reading/components/team/TeamRoster";
import { readingAuthApi, readingSemesterApi, readingSettingsApi } from "@berea/api";
import { isApiError } from "@/features/auth/utils";
import { useReadingAuthStore } from "@/features/reading/store/useReadingAuthStore";
import type { ReadingTeam, SemesterRound } from "@berea/api";
import { READING_PAGE_CONTAINER } from "@/features/reading/lib/pageContainer";

function TeamPageSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-6" aria-label="Loading your team">
      <div className="h-64 rounded-[28px] bg-[var(--rd-panel)]" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-80 rounded-2xl bg-[var(--rd-panel)]" />
        <div className="h-80 rounded-2xl bg-[var(--rd-panel)]" />
      </div>
    </div>
  );
}

export default function ReadingTeamPage() {
  const { user, updateUser } = useReadingAuthStore();

  const [team, setTeam] = useState<ReadingTeam | null>(null);
  const [rounds, setRounds] = useState<SemesterRound[]>([]);
  const [seasonStarted, setSeasonStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  useEffect(() => {
    // /users/me is what records today's check-in, so it has to land before the roster is read —
    // otherwise your own row shows you as "not in yet" on your first visit of the day.
    readingAuthApi
      .me()
      .then(updateUser)
      .catch(() => { /* still load the team below */ })
      .then(() => readingAuthApi.myTeam())
      .then(setTeam)
      .catch((err) => setLoadError(isApiError(err) ? err.detail : "Couldn't load your team."))
      .finally(() => setIsLoading(false));
  }, [updateUser]);

  useEffect(() => {
    readingSemesterApi.listRounds().then(setRounds).catch(() => { /* kickoff shows "date announced" */ });
    readingSettingsApi.get().then((s) => setSeasonStarted(s.season_started)).catch(() => { /* treat as pre-season */ });
  }, []);

  const openInvite = useCallback(() => setIsInviteOpen(true), []);
  const closeInvite = useCallback(() => setIsInviteOpen(false), []);

  async function handleRename(name: string) {
    setTeam(await readingAuthApi.renameTeam({ team_name: name }));
  }

  const me = team?.members.find((m) => m.id === user?.id);
  const isCaptain = me?.is_captain ?? false;
  const captain = team?.members.find((m) => m.is_captain);
  const activeRound = rounds.find((r) => r.status === "in_progress");

  const statItems: StatStripItem[] = team
    ? [
        { icon: Trophy, label: "Team points", value: `${team.points}`, note: `Place ${team.place} of ${team.teams_total}`, accent: false },
        {
          icon: BookOpen, label: "Books finished by everyone",
          value: rounds.length > 0 ? `${team.books_finished}/${rounds.length}` : `${team.books_finished}`,
          note: activeRound ? `${activeRound.label} in progress` : "No active round",
          accent: false,
        },
        {
          icon: Flame, label: "Your streak",
          value: `${me?.current_streak ?? 0} ${(me?.current_streak ?? 0) === 1 ? "day" : "days"}`,
          note: me?.active_today ? "Checked in today" : "Open the app today to keep it",
          accent: true,
        },
      ]
    : [];

  return (
    <MotionConfig reducedMotion="user">
    <div className={READING_PAGE_CONTAINER}>
      {isLoading ? (
        <TeamPageSkeleton />
      ) : loadError || !team ? (
        <p className="text-sm text-[var(--rd-text-muted)]">{loadError ?? "You haven't joined a team yet."}</p>
      ) : (
        <div className="flex flex-col gap-6">
          <TeamHero
            team={team}
            isCaptain={isCaptain}
            captainName={captain?.full_name ?? null}
            seasonStarted={seasonStarted}
            onRename={handleRename}
            onInvite={openInvite}
          />

          {seasonStarted && <StatStrip items={statItems} />}

          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
            <TeamRoster team={team} meId={user?.id} isCaptain={isCaptain} onInvite={openInvite} />
            {seasonStarted ? (
              <SeasonClock rounds={rounds} />
            ) : (
              <KickoffChecklist
                team={team}
                paymentStatus={user?.payment_status ?? null}
                rounds={rounds}
                isCaptain={isCaptain}
                onInvite={openInvite}
              />
            )}
          </div>
        </div>
      )}

      {isInviteOpen && team && <InvitePlayersModal team={team} onClose={closeInvite} />}
    </div>
    </MotionConfig>
  );
}
