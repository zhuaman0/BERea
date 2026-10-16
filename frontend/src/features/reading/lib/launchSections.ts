// Home and book voting stay available so students can choose the first book before kickoff.
const SEASON_ROUTES: ReadonlySet<string> = new Set([
  "/reading/leaderboard",
  "/reading/profile",
  "/reading/quiz",
]);

export function isSeasonRoute(pathname: string): boolean {
  return SEASON_ROUTES.has(pathname);
}

export function isReadingRouteLocked(pathname: string, seasonStarted: boolean): boolean {
  return !seasonStarted && isSeasonRoute(pathname);
}
