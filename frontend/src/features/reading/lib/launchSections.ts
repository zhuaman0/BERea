/**
 * Sections that stay visible in the navigation but are locked until an admin starts the season
 * (Admin → Settings → Season started).
 */
const SEASON_ROUTES: ReadonlySet<string> = new Set([
  "/reading",
  "/reading/games",
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
