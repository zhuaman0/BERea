export interface TeamTheme {
  spine:       string;
  pages:       string;
  ribbon:      string;
  text:        string;
  glow:        string;
  band:        string;
  bandSoft:    string;
  border:      string;
  patternLine: string;
}

/** Team surfaces use the league's own fire palette so every team page matches the rest of the app. */
export const TEAM_THEME: TeamTheme = {
  spine:       "fill-[#c2410c]",
  pages:       "fill-[#f3e9dc]",
  ribbon:      "fill-[#7c2d12]",
  text:        "text-[var(--rd-accent-from)]",
  glow:        "bg-[var(--rd-accent-from)]/20",
  band:        "rd-accent-gradient",
  bandSoft:    "bg-[var(--rd-accent-from)]/[0.05]",
  border:      "border-[var(--rd-accent-from)]/25",
  patternLine: "stroke-[var(--rd-accent-from)]/[0.10]",
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

const ROMAN: [number, string][] = [[10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];

/** Chapter-style numeral for a roster slot (rosters max out at a handful of readers). */
export function toRoman(n: number): string {
  let rest = n;
  let out = "";
  for (const [value, symbol] of ROMAN) {
    while (rest >= value) {
      out += symbol;
      rest -= value;
    }
  }
  return out;
}
