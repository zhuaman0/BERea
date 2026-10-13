export interface TeamTheme {
  text:        string;
  glow:        string;
  band:        string;
  border:      string;
}

/** Team surfaces use the league's own fire palette so every team page matches the rest of the app. */
export const TEAM_THEME: TeamTheme = {
  text:        "text-[var(--rd-accent-from)]",
  glow:        "bg-[var(--rd-accent-from)]/20",
  band:        "rd-accent-gradient",
  border:      "border-[var(--rd-accent-from)]/25",
};
