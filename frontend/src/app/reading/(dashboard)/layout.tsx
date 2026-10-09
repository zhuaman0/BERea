"use client";

import { useEffect, useState } from "react";
import { ReadingTopbar } from "@/features/reading/components/ReadingTopbar";
import { ReadingSidebar } from "@/features/reading/components/ReadingSidebar";
import { ReadingStageGuard } from "@/features/reading/components/auth/ReadingStageGuard";
import { readingAuthApi } from "@/features/reading/authApi";
import { readingSemesterApi } from "@/features/reading/semesterApi";
import type { ReadingTeam } from "@/features/reading/authTypes";
import type { SemesterRound } from "@/features/reading/types";

const SEASON_LABEL = "Fall semester 2026";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
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

      <div className="flex min-h-0 flex-1">
        <ReadingSidebar team={team} />
        <main className="flex-1 overflow-y-auto pb-20 md:pb-8">{children}</main>
      </div>
    </div>
  );
}
