/**
 * Registration-only launch: these sections stay visible in the navigation but are locked until the
 * season starts. Remove a route from this set to open that section.
 */
const LOCKED_READING_ROUTES: ReadonlySet<string> = new Set([
  "/reading",
  "/reading/games",
  "/reading/leaderboard",
  "/reading/profile",
  "/reading/quiz",
]);

export function isReadingRouteLocked(pathname: string): boolean {
  return LOCKED_READING_ROUTES.has(pathname);
}
