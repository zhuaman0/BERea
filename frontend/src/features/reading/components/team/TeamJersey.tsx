"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { cn } from "@/shared/lib/utils";
import type { TeamKit } from "./teamKit";

export const JERSEY_PATH =
  "M72 20 Q100 48 128 20 L165 32 L192 70 L168 86 L152 72 L152 184 Q100 192 48 184 L48 72 L32 86 L8 70 L35 32 Z";
const LEFT_CUFF = "M8 70 L32 86 L36 80 L13 64 Z";
const RIGHT_CUFF = "M192 70 L168 86 L164 80 L187 64 Z";
const COLLAR = "M72 20 Q100 48 128 20 L122 18 Q100 38 78 18 Z";
const STRIPE_XS = [64, 92, 120];

interface TeamJerseyProps {
  kit:        TeamKit;
  monogram:   string;
  className?: string;
}

export function TeamJersey({ kit, monogram, className }: TeamJerseyProps) {
  const baseId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const clipId = `jersey-clip-${baseId}`;
  const sheenId = `jersey-sheen-${baseId}`;
  const fireId = `jersey-fire-${baseId}`;

  return (
    <svg viewBox="0 0 200 200" role="img" aria-label={`${monogram} team jersey`} className={cn("overflow-visible", className)}>
      <defs>
        <clipPath id={clipId}>
          <path d={JERSEY_PATH} />
        </clipPath>
        <linearGradient id={fireId} x1="0" y1="1" x2="0.6" y2="0">
          <stop offset="0%" className="[stop-color:var(--rd-accent-from)]" />
          <stop offset="100%" className="[stop-color:var(--rd-accent-to)]" />
        </linearGradient>
        <linearGradient id={sheenId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0.28" />
          <stop offset="45%" stopColor="white" stopOpacity="0" />
          <stop offset="100%" stopColor="black" stopOpacity="0.25" />
        </linearGradient>
      </defs>

      <ellipse cx="100" cy="194" rx="58" ry="5" className="fill-black/40" />

      <path d={JERSEY_PATH} fill={`url(#${fireId})`} />

      <g clipPath={`url(#${clipId})`}>
        {STRIPE_XS.map((x) => (
          <rect key={x} x={x} y="0" width="16" height="200" className={kit.stripe} />
        ))}
        <path d={LEFT_CUFF} className={kit.trim} />
        <path d={RIGHT_CUFF} className={kit.trim} />
        <rect x="0" y="0" width="200" height="200" fill={`url(#${sheenId})`} />
        <motion.rect
          y="-20"
          width="34"
          height="240"
          className="fill-white/25"
          transform="skewX(-20)"
          initial={{ attrX: -60 }}
          animate={{ attrX: 300 }}
          transition={{ duration: 1.4, ease: "easeInOut", repeat: Infinity, repeatDelay: 4.5, delay: 1 }}
        />
      </g>

      <path d={COLLAR} className={kit.trim} />

      <text
        x="100"
        y="134"
        textAnchor="middle"
        className="fill-black/80 font-display text-[52px] font-bold tracking-tight"
      >
        {monogram}
      </text>
    </svg>
  );
}
