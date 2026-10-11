export interface TeamKit {
  trim:        string;
  stripe:      string;
  text:        string;
  glow:        string;
  band:        string;
  bandSoft:    string;
  border:      string;
  patternLine: string;
}

/** Team surfaces use the league's own fire palette so every team page matches the rest of the app. */
export const TEAM_KIT: TeamKit = {
  trim:        "fill-[#c2410c]",
  stripe:      "fill-white/15",
  text:        "text-[var(--rd-accent-from)]",
  glow:        "bg-[var(--rd-accent-from)]/20",
  band:        "rd-accent-gradient",
  bandSoft:    "bg-[var(--rd-accent-from)]/[0.06]",
  border:      "border-[var(--rd-accent-from)]/25",
  patternLine: "stroke-[var(--rd-accent-from)]/[0.12]",
};

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}
