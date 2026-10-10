export interface TeamKit {
  jersey:      string;
  trim:        string;
  stripe:      string;
  text:        string;
  glow:        string;
  band:        string;
  bandSoft:    string;
  border:      string;
  patternLine: string;
}

// Full class strings (not built by concatenation) so Tailwind's scanner can see every one.
const KITS: TeamKit[] = [
  {
    jersey: "fill-orange-500", trim: "fill-orange-700", stripe: "fill-orange-300/25",
    text: "text-orange-400", glow: "bg-orange-500/25", band: "bg-orange-500",
    bandSoft: "bg-orange-500/10", border: "border-orange-500/30", patternLine: "stroke-orange-400/15",
  },
  {
    jersey: "fill-sky-500", trim: "fill-sky-700", stripe: "fill-sky-200/25",
    text: "text-sky-400", glow: "bg-sky-500/25", band: "bg-sky-500",
    bandSoft: "bg-sky-500/10", border: "border-sky-500/30", patternLine: "stroke-sky-400/15",
  },
  {
    jersey: "fill-emerald-500", trim: "fill-emerald-700", stripe: "fill-emerald-200/25",
    text: "text-emerald-400", glow: "bg-emerald-500/25", band: "bg-emerald-500",
    bandSoft: "bg-emerald-500/10", border: "border-emerald-500/30", patternLine: "stroke-emerald-400/15",
  },
  {
    jersey: "fill-violet-500", trim: "fill-violet-700", stripe: "fill-violet-200/25",
    text: "text-violet-400", glow: "bg-violet-500/25", band: "bg-violet-500",
    bandSoft: "bg-violet-500/10", border: "border-violet-500/30", patternLine: "stroke-violet-400/15",
  },
  {
    jersey: "fill-rose-500", trim: "fill-rose-700", stripe: "fill-rose-200/25",
    text: "text-rose-400", glow: "bg-rose-500/25", band: "bg-rose-500",
    bandSoft: "bg-rose-500/10", border: "border-rose-500/30", patternLine: "stroke-rose-400/15",
  },
  {
    jersey: "fill-amber-400", trim: "fill-amber-600", stripe: "fill-amber-100/30",
    text: "text-amber-300", glow: "bg-amber-400/25", band: "bg-amber-400",
    bandSoft: "bg-amber-400/10", border: "border-amber-400/30", patternLine: "stroke-amber-300/15",
  },
];

/** Picks a kit deterministically from the team name, so a team keeps its colors everywhere. */
export function teamKit(teamName: string): TeamKit {
  let hash = 5381;
  for (const ch of teamName) hash = ((hash << 5) + hash + ch.charCodeAt(0)) | 0;
  return KITS[Math.abs(hash) % KITS.length];
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}
