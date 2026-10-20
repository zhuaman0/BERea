"use client";

import { motion } from "framer-motion";
import { cn } from "@/shared/lib/utils";
import { useCountdownMs } from "../../hooks/useNightState";
import { roundTheme } from "./roundTheme";

const TICKS = 60;
const URGENT_SECONDS = 5;

interface CountdownRingProps {
  /** Server's time left; the ring counts down smoothly between updates. */
  timeLeftMs:  number;
  syncKey:     string;
  totalMs:     number;
  roundNumber: number;
  className?:  string;
}

/** The Keynote dial: a ring of ticks that goes dark as time runs out, with the seconds inside. */
export function CountdownRing({ timeLeftMs, syncKey, totalMs, roundNumber, className }: CountdownRingProps) {
  const msLeft = useCountdownMs(timeLeftMs, syncKey);
  const theme = roundTheme(roundNumber);
  const seconds = Math.ceil(msLeft / 1000);
  const lit = totalMs > 0 ? Math.ceil((msLeft / totalMs) * TICKS) : 0;
  const urgent = seconds <= URGENT_SECONDS && seconds > 0;

  return (
    <div className={cn("relative aspect-square", className)} role="timer" aria-live="off" aria-label={String(seconds)}>
      <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full" aria-hidden="true">
        {Array.from({ length: TICKS }, (_, i) => (
          <line
            key={i}
            x1="100"
            y1="6"
            x2="100"
            y2={i % 5 === 0 ? "20" : "15"}
            strokeWidth={i % 5 === 0 ? 3 : 2}
            strokeLinecap="round"
            transform={`rotate(${i * (360 / TICKS)} 100 100)`}
            className={cn(
              "transition-colors duration-300",
              i < lit ? (urgent ? theme.stroke : "stroke-white") : "stroke-white/12",
            )}
          />
        ))}
      </svg>
      <motion.span
        key={urgent ? seconds : "calm"}
        initial={urgent ? { scale: 1 } : false}
        animate={urgent ? { scale: [1, 1.12, 1] } : { scale: 1 }}
        transition={{ duration: 0.5 }}
        className={cn(
          "font-display absolute inset-0 flex items-center justify-center text-[clamp(1.5rem,4.5vw,3.75rem)] font-bold tabular-nums",
          urgent ? theme.text : "text-white",
        )}
      >
        {Math.max(0, seconds)}
      </motion.span>
    </div>
  );
}
