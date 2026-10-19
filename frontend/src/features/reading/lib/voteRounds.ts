import type { VoteRound, VoteStage } from "@berea/api";

export const VOTE_STAGES: VoteStage[] = ["language", "genre", "book"];

export function voteStatus(round: VoteRound, now: number): VoteRound["status"] {
  if (now < Date.parse(round.opens_at)) return "scheduled";
  return now < Date.parse(round.closes_at) ? "open" : "closed";
}

export function currentSelection(rounds: VoteRound[]): VoteRound[] {
  const sorted = [...rounds].sort((a, b) => Date.parse(a.opens_at) - Date.parse(b.opens_at)
    || VOTE_STAGES.indexOf(a.stage) - VOTE_STAGES.indexOf(b.stage));
  const start = sorted.findLastIndex((round) => round.stage === "language");
  return start < 0 ? sorted : sorted.slice(start);
}

export function voteWinner(round: VoteRound | undefined): string | null {
  return round?.options.find((option) => option.id === round.winner_option_id)?.label ?? null;
}

export function nextVoteRound(selection: VoteRound[], now: number): VoteRound | null {
  const open = selection.filter((round) => voteStatus(round, now) === "open");
  return open.find((round) => !round.your_vote_option_id)
    ?? open.at(-1)
    ?? selection.find((round) => voteStatus(round, now) === "scheduled")
    ?? selection.at(-1) ?? null;
}

export function formatVoteCountdown(deadline: string, now: number): string {
  const total = Math.max(0, Math.ceil((Date.parse(deadline) - now) / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor(total / 60) % 60;
  const seconds = total % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

