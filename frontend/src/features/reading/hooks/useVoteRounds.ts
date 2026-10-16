"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { readingVoteApi, type VoteRound } from "@berea/api";
import { useReadingAuthStore } from "../store/useReadingAuthStore";
import { currentSelection, nextVoteRound } from "../lib/voteRounds";

const EMPTY_ROUNDS: VoteRound[] = [];

export function useVoteRounds() {
  const userId = useReadingAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();
  const queryKey = ["reading-votes", userId] as const;
  const query = useQuery({
    queryKey,
    queryFn: readingVoteApi.listRounds,
    enabled: Boolean(userId),
    staleTime: 0,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
  });
  const rounds = query.data ?? EMPTY_ROUNDS;
  const [now, setNow] = useState(() => Date.now());
  const { refetch } = query;

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const time = Date.now();
    const boundary = rounds.flatMap((round) => [Date.parse(round.opens_at), Date.parse(round.closes_at)])
      .filter((deadline) => deadline > time).sort((a, b) => a - b)[0];
    if (!boundary) return;
    const timer = window.setTimeout(() => { void refetch(); }, Math.min(boundary - time + 100, 2_147_483_647));
    return () => window.clearTimeout(timer);
  }, [rounds, refetch]);

  const selection = currentSelection(rounds);
  const currentRound = nextVoteRound(selection, now);

  async function recordVote(roundId: string, optionId: string) {
    await queryClient.cancelQueries({ queryKey });
    try {
      const updated = await readingVoteApi.castVote(roundId, optionId);
      queryClient.setQueryData<VoteRound[]>(queryKey, (previous) =>
        previous?.map((round) => round.id === updated.id ? updated : round));
    } finally {
      await queryClient.invalidateQueries({ queryKey });
    }
  }

  return { ...query, rounds, selection, currentRound, now, recordVote };
}
