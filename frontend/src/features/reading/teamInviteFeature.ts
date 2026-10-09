/**
 * A real invite-link flow needs its own backend feature: single-use, expiring
 * tokens (a ReadingTeamInvite row) behind a link like `/reading/register?invite=<token>`,
 * instead of today's plain team name in the URL. That hasn't been built yet.
 *
 * Until it is, this stays false and "Add students" just creates the teammate's
 * account directly — see `readingAuthApi.addTeamMember`. Flip it once the real
 * invite-token system exists, and swap the team page back to a link-sharing step.
 */
export const TEAM_INVITE_LINK_ENABLED = false;
