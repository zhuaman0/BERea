import { readingApiClient } from "./readingApiClient";

export interface ReadingAppSettings {
  leaderboard_enabled: boolean;
  season_started:      boolean;
}

export const readingSettingsApi = {
  get: () => readingApiClient.get<ReadingAppSettings>("/v1/reading/settings"),

  update: (body: Partial<ReadingAppSettings>) =>
    readingApiClient.patch<ReadingAppSettings>("/v1/reading/settings", body),
};
