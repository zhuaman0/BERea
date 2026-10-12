"use client";

import { motion } from "framer-motion";
import type { TeamCover } from "@berea/api";
import { COVER_COLORS } from "./coverOptions";
import { TeamBook } from "./TeamBook";

interface CoverShowcaseProps {
  cover:      TeamCover;
  teamName:   string;
  compact?:   boolean;
  className?: string;
}

/** A team's book cover playing the animation the team picked for it. */
export function CoverShowcase({ cover, teamName, compact = false, className }: CoverShowcaseProps) {
  const rgb = COVER_COLORS[cover.color].glow;

  const motionProps =
    cover.animation === "float"
      ? {
          animate: { y: [0, -8, 0], rotate: [-1.5, 1.5, -1.5] },
          transition: { duration: 6, repeat: Infinity, ease: "easeInOut" as const },
        }
      : cover.animation === "glow"
        ? {
            animate: {
              filter: [
                `drop-shadow(0 0 0px rgba(${rgb}, 0))`,
                `drop-shadow(0 0 26px rgba(${rgb}, 0.7))`,
                `drop-shadow(0 0 0px rgba(${rgb}, 0))`,
              ],
            },
            transition: { duration: 2.6, repeat: Infinity, ease: "easeInOut" as const },
          }
        : {};

  return (
    <motion.div key={cover.animation} className={className} {...motionProps}>
      <TeamBook cover={cover} teamName={teamName} compact={compact} className="w-full drop-shadow-2xl" />
    </motion.div>
  );
}
