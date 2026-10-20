export interface RoundTheme {
  fill:   string;
  border: string;
  text:   string;
  stroke: string;
  pulse:  string;
}

// Full class strings (never concatenated) so Tailwind's scanner sees every one.
const ROUND_THEMES: readonly RoundTheme[] = [
  { fill: "bg-[var(--rd-round-1)]", border: "border-[var(--rd-round-1)]", text: "text-[var(--rd-round-1)]", stroke: "stroke-[var(--rd-round-1)]", pulse: "[--rd-pulse:var(--rd-round-1)]" },
  { fill: "bg-[var(--rd-round-2)]", border: "border-[var(--rd-round-2)]", text: "text-[var(--rd-round-2)]", stroke: "stroke-[var(--rd-round-2)]", pulse: "[--rd-pulse:var(--rd-round-2)]" },
  { fill: "bg-[var(--rd-round-3)]", border: "border-[var(--rd-round-3)]", text: "text-[var(--rd-round-3)]", stroke: "stroke-[var(--rd-round-3)]", pulse: "[--rd-pulse:var(--rd-round-3)]" },
  { fill: "bg-[var(--rd-round-4)]", border: "border-[var(--rd-round-4)]", text: "text-[var(--rd-round-4)]", stroke: "stroke-[var(--rd-round-4)]", pulse: "[--rd-pulse:var(--rd-round-4)]" },
];

/** Rounds past the fourth reuse the palette from the start. */
export function roundTheme(roundNumber: number): RoundTheme {
  return ROUND_THEMES[(Math.max(1, roundNumber) - 1) % ROUND_THEMES.length];
}

const ROMAN = ["I", "II", "III", "IV", "V", "VI"];

export function romanRound(roundNumber: number): string {
  return ROMAN[roundNumber - 1] ?? String(roundNumber);
}

export const NIGHT_EASE = [0.16, 1, 0.3, 1] as const;
export const NIGHT_SPRING = { type: "spring", stiffness: 260, damping: 28 } as const;
