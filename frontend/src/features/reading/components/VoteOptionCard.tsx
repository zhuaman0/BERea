import { Check, Crown } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { VoteOptionResult } from "@/features/reading/types";

interface VoteOptionCardProps {
  option:     VoteOptionResult;
  isYourVote: boolean;
  isWinner:   boolean;
  canVote:    boolean;
  onVote:     () => void;
}

export function VoteOptionCard({ option, isYourVote, isWinner, canVote, onVote }: VoteOptionCardProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-xl border p-4",
        isWinner
          ? "border-[var(--rd-accent-from)] bg-[var(--rd-accent-from)]/[0.08]"
          : isYourVote
          ? "border-[var(--rd-accent-from)]/60 bg-[var(--rd-accent-from)]/[0.04]"
          : "border-[var(--rd-border)] bg-[var(--rd-panel)]"
      )}
    >
      {isWinner && (
        <span className="rd-accent-gradient absolute -top-2.5 right-3 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-black/80">
          <Crown size={11} />
          Winner
        </span>
      )}

      <div className="flex items-center justify-between gap-2">
        <p className="font-display text-[15px] font-semibold text-[var(--rd-text)]">{option.label}</p>
        {isYourVote && !isWinner && <Check size={16} className="shrink-0 text-[var(--rd-accent-from)]" />}
      </div>

      <div className="mt-3 flex items-center justify-between text-[12px]">
        <span className="font-medium text-[var(--rd-text)]">{option.percent}%</span>
        <span className="text-[var(--rd-text-muted)]">{option.vote_count} votes</span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[var(--rd-border)]">
        <div className="h-full rounded-full rd-accent-gradient" style={{ width: `${option.percent}%` }} />
      </div>

      {canVote && (
        <button
          onClick={onVote}
          className={cn(
            "mt-3 rounded-lg py-2 text-[12px] font-semibold transition-opacity hover:opacity-90",
            isYourVote ? "border border-[var(--rd-accent-from)] text-[var(--rd-text)]" : "rd-accent-gradient text-black/85"
          )}
        >
          {isYourVote ? "Voted · change" : "Vote"}
        </button>
      )}
    </div>
  );
}
