import { BookOpen, Check, Globe, Tags } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { VoteRound, VoteStage } from "@berea/api";
import { nextVoteRound, VOTE_STAGES, voteStatus, voteWinner } from "../lib/voteRounds";
import { formatVoteTime } from "../lib/formatReadingDate";
import { cn } from "@/shared/lib/utils";

const ICONS = { language: Globe, genre: Tags, book: BookOpen };

interface VoteSelectionStepsProps {
  rounds: VoteRound[];
  now: number;
  showPersonalProgress?: boolean;
}

export function VoteSelectionSteps({ rounds, now, showPersonalProgress = true }: VoteSelectionStepsProps) {
  const t = useTranslations("reading.vote");
  const locale = useLocale();
  const nextRound = nextVoteRound(rounds, now);
  const languageChosen = rounds.some((round) => round.stage === "language" && round.your_vote_option_id);
  return (
    <ol className="grid grid-cols-1 gap-3 sm:grid-cols-3" aria-label={t("steps.ariaLabel")}>
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
              <Icon size={15} /> {index + 1}. {t(`stages.${stage}`)}
              {(winner || yourChoice) && <Check size={14} className="ml-auto text-emerald-400" />}
            </div>
            <p className="mt-2 break-words text-sm font-medium text-[var(--rd-text)]">
              {winner ?? (status === "open" ? yourChoice ? t("yourChoice", { choice: yourChoice }) : needsLanguage ? t("steps.chooseLanguageFirst") : t("steps.voteNow") : status === "closed" ? round?.status !== "closed" ? t("steps.updating") : round.is_tied ? t("tied") : t("steps.noVotes") : t("steps.upNext"))}
            </p>
            <p className="mt-1 text-xs text-[var(--rd-text-muted)]">
              {round ? status === "scheduled" ? t("steps.opensAt", { time: formatVoteTime(round.opens_at, locale) })
                : status === "open" ? t("steps.closesAt", { time: formatVoteTime(round.closes_at, locale) })
                : t("steps.closedAt", { time: formatVoteTime(round.closes_at, locale) })
                : stage === "book" ? t("steps.afterLanguageGenre") : t("steps.waitingForAdmin")}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
