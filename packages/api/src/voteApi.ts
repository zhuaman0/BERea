import { readingApiClient } from "./readingApiClient";
import type { VoteRound, VoteStage } from "./types";

export interface VoteRoundCreateInput {
  stage:          VoteStage;
  options?:       string[];
  book_ids?:      string[];
  duration_hours: number;
}

export interface VoteSelectionCreateInput {
  language_options: string[];
  genre_options: string[];
}

export const readingVoteApi = {
  listRounds: () => readingApiClient.get<VoteRound[]>("/v1/reading/vote-rounds"),

  createSelection: (body: VoteSelectionCreateInput) =>
    readingApiClient.post<VoteRound[]>("/v1/reading/vote-selections", body),

  createRound: (body: VoteRoundCreateInput) =>
    readingApiClient.post<VoteRound>("/v1/reading/vote-rounds", body),

  castVote: (roundId: string, optionId: string) =>
    readingApiClient.post<VoteRound>(`/v1/reading/vote-rounds/${roundId}/vote`, { option_id: optionId }),
};
