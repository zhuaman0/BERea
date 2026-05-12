export const staleTimes = {
  never:       Infinity,
  day:         24 * 60 * 60 * 1_000,
  hour:             60 * 60 * 1_000,
  fiveMinutes:       5 * 60 * 1_000,
  oneMinute:             60 * 1_000,
  realtime:    0,
} as const satisfies Record<string, number>;
