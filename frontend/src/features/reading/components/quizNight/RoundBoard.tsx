"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import type { NightRound } from "@berea/api";
import { cn } from "@/shared/lib/utils";
import { NightShape } from "./NightShape";
import { romanRound, roundTheme } from "./roundTheme";

const ROW_STAGGER_S = 0.08;
const TILE_STAGGER_S = 0.04;
const DONE_STAGGER_S = 0.06;

interface RoundBoardProps {
  rounds:          NightRound[];
  /** The round that just finished, which animates from filled to outlined. */
  justFinished:    number | null;
  compact?:        boolean;
}

/** The night's progress: filled rows are still to play, outlined rows are done. */
export function RoundBoard({ rounds, justFinished, compact = false }: RoundBoardProps) {
  const t = useTranslations("reading.night");

  return (
    <motion.div
      key="board"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.25, delay: 0.15 } }}
      className={cn("flex flex-col", compact ? "gap-2" : "gap-3 sm:gap-5")}
      aria-label={t("board.label")}
    >
      {rounds.map((round, row) => {
        const done = round.status === "done";
        const animateDone = done && round.number === justFinished;
        return (
          <motion.div
            key={round.number}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: row * ROW_STAGGER_S, duration: 0.35 }}
            className="flex items-center gap-2 sm:gap-4"
          >
            <NightShape
              layoutId={`round-${round.number}`}
              roundNumber={round.number}
              filled={!done}
              initialFilled={animateDone || !done}
              borderWidth="thin"
              radius={compact ? 10 : 18}
              className={cn(
                "shrink-0",
                compact ? "h-9 w-24" : "h-14 w-32 sm:h-24 sm:w-72",
                round.status === "current" && cn("rd-round-pulse", roundTheme(round.number).pulse),
              )}
            >
              <span className={cn("font-display font-bold text-white", compact ? "text-sm" : "text-xl sm:text-5xl")}>
                {t("roundLabel", { roman: romanRound(round.number) })}
              </span>
            </NightShape>
            <div className="flex gap-1.5 sm:gap-3">
              {Array.from({ length: round.question_count }, (_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: row * ROW_STAGGER_S + i * TILE_STAGGER_S, duration: 0.35 }}
                  className={compact ? "size-9" : "size-14 sm:size-24"}
                >
                  <NightShape
                    roundNumber={round.number}
                    filled={!done}
                    initialFilled={animateDone || !done}
                    borderWidth="thin"
                    radius={compact ? 8 : 16}
                    delay={animateDone ? 0.3 + i * DONE_STAGGER_S : 0}
                    className="h-full w-full"
                  >
                    <span className={cn("font-display font-bold text-white", compact ? "text-sm" : "text-xl sm:text-5xl")}>{i + 1}</span>
                  </NightShape>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
