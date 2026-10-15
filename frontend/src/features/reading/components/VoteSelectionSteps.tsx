import { BookOpen, Check, Globe, Tags } from "lucide-react";
import type { VoteRound, VoteStage } from "@berea/api";
import { nextVoteRound, VOTE_LABELS, VOTE_STAGES, voteStatus, voteWinner } from "../lib/voteRounds";
import { cn } from "@/shared/lib/utils";

const ICONS = { language: Globe, genre: Tags, book: BookOpen };

interface VoteSelectionStepsProps {
  rounds: VoteRound[];
  now: number;
  showPersonalProgress?: boolean;
}

export function VoteSelectionSteps({ rounds, now, showPersonalProgress = true }: VoteSelectionStepsProps) {
  const nextRound = nextVoteRound(rounds, now);
  const languageChosen = rounds.some((round) => round.stage === "language" && round.your_vote_option_id);
  return (
    <ol className="grid grid-cols-1 gap-3 sm:grid-cols-3" aria-label="Book selection stages">
      {VOTE_STAGES.map((stage: VoteStage, index) => {
        const round = rounds.findLast((item) => item.stage === stage);
        const status = round ? voteStatus(round, now) : "scheduled";
        const winner = voteWinner(round);
        const yourChoice = showPersonalProgress ? round?.options.find((option) => option.id === round.your_vote_option_id)?.label : null;
        const needsLanguage = showPersonalProgress && stage === "genre" && !languageChosen;
        const Icon = ICONS[stage];
        return (
          <li key={stage} aria-current={status === "open" && nextRound?.id === round?.id ? "step" : undefined}
            className={cn("rounded-xl border bg-[var(--rd-panel)] p-4", status === "open" ? "border-[var(--rd-accent-from)]" : "border-[var(--rd-border)]")}>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-[var(--rd-text-muted)]">
              <Icon size={15} /> {index + 1}. {VOTE_LABELS[stage]}
              {(winner || yourChoice) && <Check size={14} className="ml-auto text-emerald-400" />}
            </div>
            <p className="mt-2 break-words text-sm font-medium text-[var(--rd-text)]">
              {winner ?? (status === "open" ? yourChoice ? `Your choice: ${yourChoice}` : needsLanguage ? "Choose language first" : "Vote now" : status === "closed" ? round?.status !== "closed" ? "Updating results…" : round.is_tied ? "Tied vote" : "No votes" : "Up next")}
            </p>
            <p className="mt-1 text-xs text-[var(--rd-text-muted)]">
              {round ? status === "scheduled" ? `Opens ${new Date(round.opens_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                : `${status === "open" ? "Closes" : "Closed"} ${new Date(round.closes_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                : stage === "book" ? "After language and genre" : "Waiting for the admin"}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
