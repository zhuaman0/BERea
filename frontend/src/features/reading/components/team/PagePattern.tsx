"use client";

import { useId } from "react";
import { cn } from "@/shared/lib/utils";
import type { TeamTheme } from "./teamTheme";

interface PagePatternProps {
  theme:      TeamTheme;
  className?: string;
}

/** Faint ruled lines with a margin rule — the "notebook page" texture behind team surfaces. */
export function PagePattern({ theme, className }: PagePatternProps) {
  const patternId = `page-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  return (
    <svg aria-hidden="true" className={cn("pointer-events-none absolute", className)}>
      <defs>
        <pattern id={patternId} width="40" height="22" patternUnits="userSpaceOnUse">
          <line x1="0" y1="21.5" x2="40" y2="21.5" strokeWidth="1" className={theme.patternLine} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      <line x1="56" y1="0" x2="56" y2="100%" strokeWidth="1" className={theme.patternLine} />
    </svg>
  );
}
