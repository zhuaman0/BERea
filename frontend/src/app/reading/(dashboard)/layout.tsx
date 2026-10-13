"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ReadingTopbar } from "@/features/reading/components/ReadingTopbar";
import { LiveQuizBanner } from "@/features/reading/components/quiz/LiveQuizBanner";
import { ReadingSidebar } from "@/features/reading/components/ReadingSidebar";
import { LockedSection } from "@/features/reading/components/LockedSection";
import { ReadingStageGuard } from "@/features/reading/components/auth/ReadingStageGuard";
import { isReadingRouteLocked } from "@/features/reading/lib/launchSections";
import { readingAuthApi } from "@berea/api";
import { readingSemesterApi } from "@berea/api";
import type { ReadingTeam } from "@berea/api";
import type { SemesterRound } from "@berea/api";

const SEASON_LABEL = "Fall semester 2026";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [team, setTeam] = useState<ReadingTeam | null>(null);
  const [rounds, setRounds] = useState<SemesterRound[]>([]);

  useEffect(() => {
    readingAuthApi.myTeam().then(setTeam).catch(() => { /* sidebar just shows nothing until it loads */ });
    readingSemesterApi.listRounds().then(setRounds).catch(() => { /* topbar falls back below */ });
  }, []);

  const activeRound = rounds.find((r) => r.status === "in_progress");
  const roundIndex = activeRound?.index ?? rounds.filter((r) => r.status === "done").length;
  const roundTotal = rounds.length;

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <ReadingStageGuard mode="require-team" />
      <ReadingTopbar seasonLabel={SEASON_LABEL} roundIndex={roundIndex} roundTotal={roundTotal} totalPoints={0} />
      {!isReadingRouteLocked("/reading/quiz") && <LiveQuizBanner />}

      <div className="flex min-h-0 flex-1">
        <ReadingSidebar team={team} />
        <main className="flex-1 overflow-y-auto pb-20 md:pb-8">
          {isReadingRouteLocked(pathname) ? <LockedSection pathname={pathname} /> : children}
        </main>
      </div>
    </div>
  );
}
