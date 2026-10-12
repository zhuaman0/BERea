import { readingApiClient } from "./readingApiClient";
import type { SemesterRound } from "./types";

export const readingSemesterApi = {
  listRounds: () => readingApiClient.get<SemesterRound[]>("/v1/reading/semester-rounds"),
};
