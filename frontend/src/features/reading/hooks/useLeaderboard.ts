"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { readingAuthApi, readingSettingsApi } from "@berea/api";
import type { ReadingTeamSummary } from "@berea/api";
import { isApiError } from "@/features/auth/utils";

interface LeaderboardState {
  teams: ReadingTeamSummary[];
  isLoading: boolean;
  loadError: string | null;
  leaderboardEnabled: boolean;
  isCheckingAccess: boolean;
  reload: () => void;
}

export function useLeaderboard(): LeaderboardState {
  const t = useTranslations("reading.leaderboard");
  const [teams, setTeams] = useState<ReadingTeamSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [leaderboardEnabled, setLeaderboardEnabled] = useState(true);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);

  const requestTeams = useCallback(() => {
    readingAuthApi
      .listTeams()
      .then(setTeams)
      .catch((error) => setLoadError(isApiError(error) ? error.detail : t("loadError")))
      .finally(() => setIsLoading(false));
  }, [t]);

  const reload = useCallback(() => {
    setIsLoading(true);
    setLoadError(null);
    requestTeams();
  }, [requestTeams]);

  useEffect(() => {
    readingSettingsApi
      .get()
      .then((settings) => setLeaderboardEnabled(settings.leaderboard_enabled))
      .catch(() => { /* Keep the page available if settings cannot be loaded. */ })
      .finally(() => setIsCheckingAccess(false));
    requestTeams();
  }, [requestTeams]);

  return { teams, isLoading, loadError, leaderboardEnabled, isCheckingAccess, reload };
}
