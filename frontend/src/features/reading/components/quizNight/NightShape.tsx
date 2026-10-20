"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/shared/lib/utils";
import { NIGHT_SPRING, roundTheme } from "./roundTheme";

interface NightShapeProps {
  roundNumber:    number;
  /** Filled = a number card / round card; outlined = a question frame or a finished round. */
  filled:         boolean;
  /** Shapes sharing a layoutId morph into each other between phases (Keynote's Magic Move). */
  layoutId?:      string;
  /** Where the fill starts; defaults to the opposite state so every change animates. */
  initialFilled?: boolean;
  radius?:        number;
  borderWidth?:   "thin" | "thick";
  delay?:         number;
  className?:     string;
  children?:      ReactNode;
}

/**
 * The one shape the whole night is built from. A fill layer and a border layer fade against
 * each other while framer-motion morphs size and position, so a filled number square can grow
 * into an outlined question frame and back.
 */
export function NightShape({
  roundNumber,
  filled,
  layoutId,
  initialFilled = !filled,
  radius = 24,
  borderWidth = "thick",
  delay = 0,
  className,
  children,
}: NightShapeProps) {
  const theme = roundTheme(roundNumber);
  const layerTransition = { duration: 0.3, delay, ease: "easeOut" } as const;
  // A shape with a layoutId grows straight out of its predecessor's box (no crossfade, which
  // would show both half-transparent). Shapes without one fade in on their own.
  const morphs = layoutId !== undefined;

  return (
    <motion.div
      layoutId={layoutId}
      layoutCrossfade={false}
      initial={morphs ? { borderRadius: radius } : { opacity: 0, borderRadius: radius }}
      animate={{ opacity: 1, borderRadius: radius }}
      transition={{ layout: NIGHT_SPRING, opacity: { duration: 0.25 } }}
      className={cn("relative flex items-center justify-center overflow-hidden", className)}
    >
      <motion.div
        aria-hidden="true"
        className={cn("absolute inset-0 rounded-[inherit]", theme.fill)}
        initial={{ opacity: initialFilled ? 1 : 0 }}
        animate={{ opacity: filled ? 1 : 0 }}
        transition={layerTransition}
      />
      <motion.div
        aria-hidden="true"
        className={cn(
          "absolute inset-0 rounded-[inherit]",
          borderWidth === "thick" ? "border-[10px] sm:border-[14px]" : "border-[3px] sm:border-4",
          theme.border,
        )}
        initial={{ opacity: initialFilled ? 0 : 1 }}
        animate={{ opacity: filled ? 0 : 1 }}
        transition={layerTransition}
      />
      <motion.div layout="position" className="relative flex h-full w-full items-center justify-center">
        {children}
      </motion.div>
    </motion.div>
  );
}
