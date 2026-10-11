"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { cn } from "@/shared/lib/utils";
import type { TeamTheme } from "./teamTheme";

export const BOOK_COVER = { x: 40, y: 20, width: 116, height: 152, radius: 8 } as const;
export const BOOK_SPINE_WIDTH = 16;
const PAGE_EDGE_XS = [160, 164, 168];

interface TeamBookProps {
  theme:      TeamTheme;
  monogram:   string;
  className?: string;
}

/** The team's emblem: a hardcover book with the team monogram on the cover. */
export function TeamBook({ theme, monogram, className }: TeamBookProps) {
  const baseId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const clipId = `book-clip-${baseId}`;
  const fireId = `book-fire-${baseId}`;
  const sheenId = `book-sheen-${baseId}`;
  const { x, y, width, height, radius } = BOOK_COVER;
  const coverCenterX = x + BOOK_SPINE_WIDTH + (width - BOOK_SPINE_WIDTH) / 2;

  return (
    <svg viewBox="0 0 200 200" role="img" aria-label={`${monogram} team book`} className={cn("overflow-visible", className)}>
      <defs>
        <clipPath id={clipId}>
          <rect x={x} y={y} width={width} height={height} rx={radius} />
        </clipPath>
        <linearGradient id={fireId} x1="0" y1="1" x2="0.7" y2="0">
          <stop offset="0%" className="[stop-color:var(--rd-accent-from)]" />
          <stop offset="100%" className="[stop-color:var(--rd-accent-to)]" />
        </linearGradient>
        <linearGradient id={sheenId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0.3" />
          <stop offset="50%" stopColor="white" stopOpacity="0" />
          <stop offset="100%" stopColor="black" stopOpacity="0.22" />
        </linearGradient>
      </defs>

      <ellipse cx="104" cy="190" rx="64" ry="5" className="fill-black/40" />

      <rect x={x + 10} y={y + 6} width={width + 6} height={height - 4} rx={radius} className={theme.pages} />
      {PAGE_EDGE_XS.map((edgeX) => (
        <line key={edgeX} x1={edgeX} y1={y + 12} x2={edgeX} y2={y + height - 6} strokeWidth="0.8" className="stroke-black/15" />
      ))}

      <motion.path
        d={`M128 ${y} L140 ${y} L140 ${y + height + 16} L134 ${y + height + 9} L128 ${y + height + 16} Z`}
        className={theme.ribbon}
        style={{ transformOrigin: `134px ${y}px` }}
        animate={{ rotate: [-2, 2, -2] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      <rect x={x} y={y} width={width} height={height} rx={radius} fill={`url(#${fireId})`} />

      <g clipPath={`url(#${clipId})`}>
        <rect x={x} y={y} width={BOOK_SPINE_WIDTH} height={height} className={theme.spine} />
        <line x1={x} y1={y + 22} x2={x + BOOK_SPINE_WIDTH} y2={y + 22} strokeWidth="1.5" className="stroke-white/30" />
        <line x1={x} y1={y + height - 22} x2={x + BOOK_SPINE_WIDTH} y2={y + height - 22} strokeWidth="1.5" className="stroke-white/30" />
        <rect x={x} y={y} width={width} height={height} fill={`url(#${sheenId})`} />
        <motion.rect
          y={y - 20}
          width="30"
          height={height + 40}
          className="fill-white/25"
          transform="skewX(-18)"
          initial={{ attrX: -40 }}
          animate={{ attrX: 260 }}
          transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 5, delay: 1 }}
        />
      </g>

      <rect
        x={x + BOOK_SPINE_WIDTH + 10}
        y={y + 14}
        width={width - BOOK_SPINE_WIDTH - 20}
        height={height - 28}
        rx="4"
        strokeWidth="1.5"
        className="fill-none stroke-black/20"
      />

      <text
        x={coverCenterX}
        y={y + height / 2 + 8}
        textAnchor="middle"
        className="fill-black/80 font-serif text-[44px] font-bold"
      >
        {monogram}
      </text>
      <line x1={coverCenterX - 18} x2={coverCenterX + 18} y1={y + height / 2 + 24} y2={y + height / 2 + 24} strokeWidth="1.5" className="stroke-black/40" />
    </svg>
  );
}
