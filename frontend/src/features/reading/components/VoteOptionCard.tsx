"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AnimatedNumber, ProgressBar } from "@berea/ui-kit";
import { Check, Crown, Loader2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { VoteOptionResult } from "@berea/api";

const EASE = [0.16, 1, 0.3, 1] as const;

interface VoteOptionCardProps {
  option:      VoteOptionResult;
  index:       number;
  isYourVote:  boolean;
  isWinner:    boolean;
  canVote:     boolean;
  isPending:   boolean;
  isLocked:    boolean;
  justVoted:   boolean;
  onVote:      () => void;
}

export function VoteOptionCard({
  option,
  index,
  isYourVote,
  isWinner,
  canVote,
  isPending,
  isLocked,
  justVoted,
  onVote,
}: VoteOptionCardProps) {
  const isInteractive = canVote && !isLocked;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.97 }}
      animate={{ opacity: isLocked && !isPending ? 0.55 : 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, delay: index * 0.07, ease: EASE }}
      whileHover={isInteractive ? { y: -4 } : undefined}
      className={cn(
        "group relative flex flex-col rounded-xl border p-4 transition-[border-color,box-shadow,background-color] duration-300",
        isWinner
          ? "border-[var(--rd-accent-from)] bg-[var(--rd-accent-from)]/[0.08] shadow-[0_0_40px_-12px_var(--rd-accent-from)]"
          : isYourVote
            ? "border-transparent bg-[var(--rd-accent-from)]/[0.05]"
            : "border-[var(--rd-border)] bg-[var(--rd-panel)]",
        isInteractive && !isYourVote && !isWinner &&
          "hover:border-[var(--rd-accent-from)]/45 hover:shadow-[0_18px_40px_-20px_rgba(255,107,44,0.55)]"
      )}
    >
      {isYourVote && !isWinner && (
        <motion.span
          layoutId="vote-selection-ring"
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          className="pointer-events-none absolute inset-0 rounded-xl border-2 border-[var(--rd-accent-from)]"
        />
      )}

      <AnimatePresence>
        {justVoted && (
          <motion.span
            key="ripple"
            initial={{ opacity: 0.7, scale: 1 }}
            animate={{ opacity: 0, scale: 1.12 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="pointer-events-none absolute inset-0 rounded-xl border-2 border-[var(--rd-accent-to)]"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isWinner && (
          <motion.span
            initial={{ opacity: 0, y: -10, scale: 0.6 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 420, damping: 18 }}
            className="rd-accent-gradient absolute -top-2.5 right-3 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-black/80"
          >
            <Crown size={11} />
            Winner
          </motion.span>
        )}
      </AnimatePresence>

      <div className="relative flex items-center justify-between gap-2">
        <p className="font-display text-[15px] font-semibold text-[var(--rd-text)]">{option.label}</p>
        <AnimatePresence>
          {isYourVote && !isWinner && (
            <motion.span
              key="check"
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--rd-accent-from)] text-black/85"
            >
              <Check size={12} strokeWidth={3} />
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div className="relative mt-3 flex items-center justify-between text-[12px]">
        <span className="font-medium text-[var(--rd-text)]">
          <AnimatedNumber value={option.percent} />%
        </span>
        <span className="text-[var(--rd-text-muted)]">
          <AnimatedNumber value={option.vote_count} /> {option.vote_count === 1 ? "vote" : "votes"}
        </span>
      </div>
      <ProgressBar percent={option.percent} size="sm" delay={0.15 + index * 0.05} className="relative mt-1" />

      {canVote && (
        <motion.button
          type="button"
          onClick={onVote}
          disabled={isLocked}
          whileTap={isInteractive ? { scale: 0.96 } : undefined}
          aria-busy={isPending}
          className={cn(
            "relative mt-3 flex h-9 items-center justify-center overflow-hidden rounded-lg text-[12px] font-semibold transition-opacity disabled:cursor-not-allowed",
            isYourVote ? "border border-[var(--rd-accent-from)] text-[var(--rd-text)]" : "rd-accent-gradient text-black/85",
            isInteractive && "hover:opacity-90"
          )}
        >
          {!isYourVote && isInteractive && (
            <span className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/30 opacity-0 transition-all duration-700 group-hover:left-[120%] group-hover:opacity-100" />
          )}
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={isPending ? "pending" : isYourVote ? "voted" : "vote"}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="relative inline-flex items-center gap-1.5"
            >
              {isPending ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  Saving…
                </>
              ) : isYourVote ? (
                "Voted · change"
              ) : (
                "Vote"
              )}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      )}
    </motion.div>
  );
}
