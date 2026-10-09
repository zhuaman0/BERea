import { readingApiClient } from "@/features/reading/lib/readingApiClient";

export interface ReadingAppSettings {
  leaderboard_enabled: boolean;
}

export const readingSettingsApi = {
  get: () => readingApiClient.get<ReadingAppSettings>("/v1/reading/settings"),

  update: (body: ReadingAppSettings) =>
    readingApiClient.patch<ReadingAppSettings>("/v1/reading/settings", body),
};
