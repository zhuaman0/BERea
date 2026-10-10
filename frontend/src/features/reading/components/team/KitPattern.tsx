"use client";

import { useId } from "react";
import { cn } from "@/shared/lib/utils";
import type { TeamKit } from "./teamKit";

interface KitPatternProps {
  kit:        TeamKit;
  className?: string;
}

/** Diagonal pinstripes in the team's kit color — the "jersey fabric" behind team surfaces. */
export function KitPattern({ kit, className }: KitPatternProps) {
  const patternId = `kit-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  return (
    <svg aria-hidden="true" className={cn("pointer-events-none absolute", className)}>
      <defs>
        <pattern id={patternId} width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
          <line x1="0" y1="0" x2="0" y2="18" strokeWidth="6" className={kit.patternLine} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}
