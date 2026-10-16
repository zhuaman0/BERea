// The leaderboard has its own admin toggle, so it does not also inherit the season-start lock.
const SEASON_ROUTES: ReadonlySet<string> = new Set([
  "/reading/profile",
  "/reading/quiz",
]);

export function isSeasonRoute(pathname: string): boolean {
  return SEASON_ROUTES.has(pathname);
}

export function isReadingRouteLocked(pathname: string, seasonStarted: boolean): boolean {
  return !seasonStarted && isSeasonRoute(pathname);
}
