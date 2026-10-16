"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LeaderboardHero } from "@/features/reading/components/leaderboard/LeaderboardHero";
import { LeaderboardPodium } from "@/features/reading/components/leaderboard/LeaderboardPodium";
import { LeaderboardState } from "@/features/reading/components/leaderboard/LeaderboardState";
import { LeaderboardTable } from "@/features/reading/components/leaderboard/LeaderboardTable";
import { useLeaderboard } from "@/features/reading/hooks/useLeaderboard";
import { READING_PAGE_CONTAINER } from "@/features/reading/lib/pageContainer";
import { useReadingAuthStore } from "@/features/reading/store/useReadingAuthStore";

const FLASH_DURATION_MS = 1_600;

export default function ReadingLeaderboardPage() {
  const myTeamName = useReadingAuthStore((state) => state.user?.team_name ?? null);
  const { teams, isLoading, loadError, leaderboardEnabled, isCheckingAccess, reload } = useLeaderboard();
  const [query, setQuery] = useState("");
  const [flashId, setFlashId] = useState<string | null>(null);
  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});
  const flashTimerRef = useRef<number | null>(null);

  const myTeamIndex = teams.findIndex((team) => team.name === myTeamName);
  const myTeam = myTeamIndex >= 0 ? teams[myTeamIndex] : null;
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const visibleTeams = useMemo(
    () => teams.filter((team) => team.name.toLocaleLowerCase().includes(normalizedQuery)),
    [normalizedQuery, teams],
  );
  const rankById = useMemo(
    () => Object.fromEntries(teams.map((team, index) => [team.id, index + 1])),
    [teams],
  );

  useEffect(() => () => {
    if (flashTimerRef.current !== null) window.clearTimeout(flashTimerRef.current);
  }, []);

  function handleShowMyPlace() {
    if (!myTeam) return;

    setQuery("");
    setFlashId(myTeam.id);
    if (flashTimerRef.current !== null) window.clearTimeout(flashTimerRef.current);

    window.setTimeout(() => {
      rowRefs.current[myTeam.id]?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 0);
    flashTimerRef.current = window.setTimeout(() => setFlashId(null), FLASH_DURATION_MS);
  }

  if (!isCheckingAccess && !leaderboardEnabled) {
    return <div className={READING_PAGE_CONTAINER}><LeaderboardState variant="locked" /></div>;
  }

  return (
    <div className={READING_PAGE_CONTAINER}>
      <LeaderboardHero teams={teams} myTeam={myTeam} myRank={myTeamIndex >= 0 ? myTeamIndex + 1 : null} onShowMyPlace={handleShowMyPlace} />

      {isLoading ? (
        <LeaderboardState variant="loading" />
      ) : loadError ? (
        <LeaderboardState variant="error" message={loadError} onRetry={reload} />
      ) : teams.length === 0 ? (
        <LeaderboardState variant="empty" />
      ) : (
        <>
          <LeaderboardPodium teams={teams.slice(0, 3)} myTeamName={myTeamName} />
          <LeaderboardTable
            teams={visibleTeams}
            totalTeams={teams.length}
            rankById={rankById}
            query={query}
            myTeamName={myTeamName}
            flashId={flashId}
            rowRefs={rowRefs}
            onQueryChange={setQuery}
            onClearQuery={() => setQuery("")}
          />
        </>
      )}
    </div>
  );
}
