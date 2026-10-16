"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { cn } from "@/shared/lib/utils";
import type { TeamCover } from "@berea/api";
import { COVER_COLORS, COVER_EMBLEMS } from "./coverOptions";
import { initials } from "@berea/core";

const BOOK_COVER = { x: 40, y: 20, width: 116, height: 152, radius: 8 } as const;
const BOOK_SPINE_WIDTH = 16;
const PAGE_EDGE_XS = [160, 164, 168];
const TITLE_LINE_CHARS = 12;

/** Greedy word wrap into at most two lines; SVG text has no native wrapping. */
function wrapTitle(title: string): string[] {
  const lines: string[] = [];
  let current = "";
  for (const word of title.split(/\s+/).filter(Boolean)) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= TITLE_LINE_CHARS || !current) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  if (lines.length <= 2) return lines;
  return [lines[0], `${lines.slice(1).join(" ").slice(0, TITLE_LINE_CHARS - 1)}…`];
}

interface TeamBookProps {
  cover:      TeamCover;
  teamName:   string;
  compact?:   boolean;
  className?: string;
}

/** The team's emblem: a hardcover book whose cover each team designs itself. */
export function TeamBook({ cover, teamName, compact = false, className }: TeamBookProps) {
  const t = useTranslations("reading.team.cover");
  const baseId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const clipId = `book-clip-${baseId}`;
  const gradientId = `book-color-${baseId}`;
  const sheenId = `book-sheen-${baseId}`;
  const patternId = `book-pattern-${baseId}`;

  const color = COVER_COLORS[cover.color];
  const EmblemIcon = COVER_EMBLEMS[cover.emblem];
  const isAnimated = !compact && cover.animation !== "still";
  const titleLines = wrapTitle(cover.title ?? teamName);

  const { x, y, width, height, radius } = BOOK_COVER;
  const faceX = x + BOOK_SPINE_WIDTH;
  const faceWidth = width - BOOK_SPINE_WIDTH;
  const centerX = faceX + faceWidth / 2;
  const emblemCenterY = compact ? y + height / 2 : y + height * 0.62;
  const emblemSize = compact ? 64 : 46;

  return (
    <svg viewBox="0 0 200 200" role="img" aria-label={t("bookAria", { name: teamName })} className={cn("overflow-visible", className)}>
      <defs>
        <clipPath id={clipId}>
          <rect x={x} y={y} width={width} height={height} rx={radius} />
        </clipPath>
        <linearGradient id={gradientId} x1="0" y1="1" x2="0.7" y2="0">
          <stop offset="0%" className={color.from} />
          <stop offset="100%" className={color.to} />
        </linearGradient>
        <linearGradient id={sheenId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0.28" />
          <stop offset="50%" stopColor="white" stopOpacity="0" />
          <stop offset="100%" stopColor="black" stopOpacity="0.22" />
        </linearGradient>
        {cover.pattern === "stripes" && (
          <pattern id={patternId} width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(-40)">
            <line x1="0" y1="0" x2="0" y2="12" strokeWidth="4" className={color.ink.overlay} />
          </pattern>
        )}
        {cover.pattern === "dots" && (
          <pattern id={patternId} width="10" height="10" patternUnits="userSpaceOnUse">
            <circle cx="5" cy="5" r="1.4" className={color.ink.overlay} />
          </pattern>
        )}
        {cover.pattern === "lines" && (
          <pattern id={patternId} width="10" height="9" patternUnits="userSpaceOnUse">
            <line x1="0" y1="8.5" x2="10" y2="8.5" strokeWidth="0.8" className={color.ink.overlay} />
          </pattern>
        )}
      </defs>

      <ellipse cx="104" cy="190" rx="64" ry="5" className="fill-black/40" />

      <rect x={x + 10} y={y + 6} width={width + 6} height={height - 4} rx={radius} className="fill-[#f3e9dc]" />
      {PAGE_EDGE_XS.map((edgeX) => (
        <line key={edgeX} x1={edgeX} y1={y + 12} x2={edgeX} y2={y + height - 6} strokeWidth="0.8" className="stroke-black/15" />
      ))}

      <motion.path
        d={`M128 ${y} L140 ${y} L140 ${y + height + 16} L134 ${y + height + 9} L128 ${y + height + 16} Z`}
        className="fill-[#7c2d12]"
        style={{ transformOrigin: `134px ${y}px` }}
        animate={isAnimated ? { rotate: [-2, 2, -2] } : undefined}
        transition={isAnimated ? { duration: 4, repeat: Infinity, ease: "easeInOut" } : undefined}
      />

      <rect x={x} y={y} width={width} height={height} rx={radius} fill={`url(#${gradientId})`} />

      <g clipPath={`url(#${clipId})`}>
        {cover.pattern !== "plain" && <rect x={faceX} y={y} width={faceWidth} height={height} fill={`url(#${patternId})`} />}
        <rect x={x} y={y} width={BOOK_SPINE_WIDTH} height={height} className={color.spine} />
        <line x1={x} y1={y + 22} x2={faceX} y2={y + 22} strokeWidth="1.5" className="stroke-white/30" />
        <line x1={x} y1={y + height - 22} x2={faceX} y2={y + height - 22} strokeWidth="1.5" className="stroke-white/30" />
        <rect x={x} y={y} width={width} height={height} fill={`url(#${sheenId})`} />
        {isAnimated && (
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
        )}
      </g>

      {!compact && (
        <>
          <rect x={faceX + 9} y={y + 12} width={faceWidth - 18} height={height - 24} rx="4" strokeWidth="1.5" className={cn("fill-none", color.ink.stroke)} />
          {titleLines.map((line, i) => (
            <text
              key={i}
              x={centerX}
              y={y + 42 + i * 19}
              textAnchor="middle"
              className={cn("font-serif text-[16px] font-bold", color.ink.fill)}
            >
              {line}
            </text>
          ))}
          <line x1={centerX - 16} x2={centerX + 16} y1={y + 52 + (titleLines.length - 1) * 19} y2={y + 52 + (titleLines.length - 1) * 19} strokeWidth="1.2" className={color.ink.stroke} />
        </>
      )}

      {cover.emblem === "monogram" ? (
        <text
          x={centerX}
          y={emblemCenterY + (compact ? 20 : 14)}
          textAnchor="middle"
          className={cn("font-serif font-bold", compact ? "text-[56px]" : "text-[40px]", color.ink.fill)}
        >
          {initials(teamName)}
        </text>
      ) : (
        <EmblemIcon
          x={centerX - emblemSize / 2}
          y={emblemCenterY - emblemSize / 2}
          width={emblemSize}
          height={emblemSize}
          strokeWidth={1.6}
          className={color.ink.text}
        />
      )}
    </svg>
  );
}
