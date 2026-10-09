import { readingApiClient } from "@/features/reading/lib/readingApiClient";
import type { SemesterRound } from "@/features/reading/types";

export const readingSemesterApi = {
  listRounds: () => readingApiClient.get<SemesterRound[]>("/v1/reading/semester-rounds"),
};
