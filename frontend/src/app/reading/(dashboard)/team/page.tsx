"use client";

import { useCallback, useEffect, useState } from "react";
import { MotionConfig } from "framer-motion";
import { BookOpen, Flame, Trophy } from "lucide-react";
import { StatStrip, type StatStripItem } from "@berea/ui-kit";
import { AddStudentsModal } from "@/features/reading/components/team/AddStudentsModal";
import { CoverBuilderModal } from "@/features/reading/components/team/CoverBuilderModal";
import { CheckInPanel } from "@/features/reading/components/team/CheckInPanel";
import { OpenSpotCard } from "@/features/reading/components/team/OpenSpotCard";
import { PlayerCard } from "@/features/reading/components/team/PlayerCard";
import { SeasonClock } from "@/features/reading/components/team/SeasonClock";
import { TeamHero } from "@/features/reading/components/team/TeamHero";
import { TEAM_THEME } from "@/features/reading/components/team/teamTheme";
import { readingAuthApi } from "@berea/api";
import { readingSemesterApi } from "@berea/api";
import { isApiError } from "@/features/auth/utils";
import { useReadingAuthStore } from "@/features/reading/store/useReadingAuthStore";
import type { ReadingTeam } from "@berea/api";
import type { SemesterRound } from "@berea/api";
import { READING_PAGE_CONTAINER } from "@/features/reading/lib/pageContainer";

function TeamPageSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-6" aria-label="Loading your team">
      <div className="h-64 rounded-[28px] bg-[var(--rd-panel)]" />
      <div className="h-28 rounded-2xl bg-[var(--rd-panel)]" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 2xl:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-80 rounded-2xl bg-[var(--rd-panel)]" />
        ))}
      </div>
    </div>
  );
}

export default function ReadingTeamPage() {
  const { user, updateUser } = useReadingAuthStore();

  const [team, setTeam] = useState<ReadingTeam | null>(null);
  const [rounds, setRounds] = useState<SemesterRound[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);

  useEffect(() => {
    // /users/me is what records today's check-in, so it has to land before the roster is read —
    // otherwise your own card shows you as "not in yet" on your first visit of the day.
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
    readingSemesterApi.listRounds().then(setRounds).catch(() => { /* season clock shows "coming soon" */ });
  }, []);

  const openAddModal = useCallback(() => setIsAddModalOpen(true), []);
  const closeAddModal = useCallback(() => setIsAddModalOpen(false), []);
  const openCoverModal = useCallback(() => setIsCoverModalOpen(true), []);
  const closeCoverModal = useCallback(() => setIsCoverModalOpen(false), []);

  async function handleRename(name: string) {
    const updated = await readingAuthApi.renameTeam({ team_name: name });
    setTeam(updated);
  }

  const me = team?.members.find((m) => m.id === user?.id);
  const currentStreak = me?.current_streak ?? user?.current_streak ?? 0;
  const activeRound = rounds.find((r) => r.status === "in_progress");

  const statItems: StatStripItem[] = [
    {
      icon: Trophy, label: "Team points",
      value: team ? `${team.points}` : "—",
      note: "From quiz nights and bonus tasks",
      accent: false,
    },
    {
      icon: BookOpen, label: "Team books finished",
      value: team ? (rounds.length > 0 ? `${team.books_finished}/${rounds.length}` : `${team.books_finished}`) : "—",
      note: activeRound
        ? `${activeRound.label} in progress`
        : rounds.some((r) => r.status !== "locked") ? "No active round" : "Season hasn't started yet",
      accent: false,
    },
    {
      icon: Flame, label: "Your streak",
      value: `${currentStreak} ${currentStreak === 1 ? "day" : "days"}`,
      note: me?.active_today ? "Checked in today" : "Check in today to keep it going",
      accent: true,
    },
  ];

  return (
    <MotionConfig reducedMotion="user">
      <div className={READING_PAGE_CONTAINER}>
        {isLoading ? (
          <TeamPageSkeleton />
        ) : loadError || !team ? (
          <p className="text-sm text-[var(--rd-text-muted)]">{loadError ?? "You haven't joined a team yet."}</p>
        ) : (
          <>
            <TeamHero
              team={team}
              theme={TEAM_THEME}
              roundLabel={activeRound ? `${activeRound.label} in play` : null}
              onRename={handleRename}
              onAddStudents={openAddModal}
              onDesignCover={openCoverModal}
            />

            <div className="mt-6">
              <StatStrip items={statItems} />
            </div>

            <div className="mb-4 mt-10 flex items-baseline justify-between">
              <h2 className="font-display text-xl font-semibold text-[var(--rd-text)]">The reading circle</h2>
              <span className="text-sm text-[var(--rd-text-muted)]">
                {team.members.length}/{team.max_members} players
              </span>
            </div>

            <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
              <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 2xl:grid-cols-3">
                {team.members.map((member, i) => (
                  <PlayerCard
                    key={member.id}
                    member={member}
                    theme={TEAM_THEME}
                    isMe={member.id === user?.id}
                    index={i}
                  />
                ))}
                {team.members.length < team.max_members && (
                  <OpenSpotCard
                    spotsLeft={team.max_members - team.members.length}
                    index={team.members.length}
                    onAdd={openAddModal}
                  />
                )}
              </section>

              <aside className="flex flex-col gap-6">
                <CheckInPanel members={team.members} />
                <SeasonClock rounds={rounds} />
              </aside>
            </div>
          </>
        )}

        {isAddModalOpen && team && (
          <AddStudentsModal team={team} onClose={closeAddModal} onTeamUpdated={setTeam} />
        )}

        {isCoverModalOpen && team && (
          <CoverBuilderModal team={team} onClose={closeCoverModal} onSaved={setTeam} />
        )}
      </div>
    </MotionConfig>
  );
}
