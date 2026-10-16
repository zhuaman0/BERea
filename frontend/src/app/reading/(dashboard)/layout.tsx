"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ReadingTopbar } from "@/features/reading/components/ReadingTopbar";
import { LiveQuizBanner } from "@/features/reading/components/quiz/LiveQuizBanner";
import { ReadingSidebar } from "@/features/reading/components/ReadingSidebar";
import { LockedSection } from "@/features/reading/components/LockedSection";
import { ReadingStageGuard } from "@/features/reading/components/auth/ReadingStageGuard";
import { isReadingRouteLocked, isSeasonRoute } from "@/features/reading/lib/launchSections";
import { useReadingAuthStore } from "@/features/reading/store/useReadingAuthStore";
import { roundDayProgress, semesterOf } from "@/features/reading/lib/roundCalendar";
import { readingAuthApi } from "@berea/api";
import { readingSemesterApi } from "@berea/api";
import { readingSettingsApi } from "@berea/api";
import type { ReadingAppSettings } from "@berea/api";
import type { ReadingTeam } from "@berea/api";
import type { SemesterRound } from "@berea/api";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const userName = useReadingAuthStore((s) => s.user?.full_name ?? null);
  const canPreviewSeason = useReadingAuthStore((s) => Boolean(s.user?.is_admin || s.user?.is_tester));
  const [team, setTeam] = useState<ReadingTeam | null>(null);
  const [rounds, setRounds] = useState<SemesterRound[]>([]);
  const [roundsLoadedAt, setRoundsLoadedAt] = useState<number | null>(null);
  const [settings, setSettings] = useState<ReadingAppSettings | null>(null);

  useEffect(() => {
    readingSettingsApi
      .get()
      .then(setSettings)
      .catch(() => setSettings({ leaderboard_enabled: true, season_started: false }));
    readingAuthApi.myTeam().then(setTeam).catch(() => { /* sidebar just shows nothing until it loads */ });
    readingSemesterApi
      .listRounds()
      .then((loaded) => {
        setRounds(loaded);
        setRoundsLoadedAt(Date.now());
      })
      .catch(() => { /* topbar falls back below */ });
  }, []);

  const activeRound = rounds.find((r) => r.status === "in_progress");
  const roundIndex = activeRound?.index ?? rounds.filter((r) => r.status === "done").length;
  const roundTotal = rounds.length;
  // Testers and admins get every section before kickoff; everyone else waits for "Season started".
  const seasonStarted = (settings?.season_started ?? false) || canPreviewSeason;
  const isRegistrationPhase = roundsLoadedAt !== null && !rounds.some((r) => r.status !== "locked");
  const dayProgress = activeRound && roundsLoadedAt !== null ? roundDayProgress(activeRound, roundsLoadedAt) : null;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <ReadingStageGuard mode="require-team" />
      <ReadingTopbar
        semester={semesterOf(rounds)}
        roundIndex={roundIndex}
        roundTotal={roundTotal}
        isRegistrationPhase={isRegistrationPhase}
        dayProgress={dayProgress}
        totalPoints={team?.points ?? 0}
        userName={userName}
      />
      {seasonStarted && <LiveQuizBanner />}

      <div className="flex min-h-0 flex-1">
        <ReadingSidebar
          team={team}
          seasonStarted={seasonStarted}
          leaderboardEnabled={settings?.leaderboard_enabled ?? true}
        />
        <main className="flex-1 overflow-y-auto pb-20 md:pb-8">
          {settings === null && isSeasonRoute(pathname)
            ? null
            : isReadingRouteLocked(pathname, seasonStarted)
              ? <LockedSection pathname={pathname} />
              : children}
        </main>
      </div>
    </div>
  );
}
