import { readingApiClient } from "./readingApiClient";

export interface ReadingAdminUser {
  id:               string;
  full_name:        string;
  email:            string;
  team_name:        string | null;
  is_admin:         boolean;
  current_streak:   number;
  last_active_date: string | null;
  created_at:       string;
}

export const readingAdminApi = {
  listUsers: () => readingApiClient.get<ReadingAdminUser[]>("/v1/reading/users"),
};
