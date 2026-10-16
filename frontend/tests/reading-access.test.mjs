import assert from "node:assert/strict";
import { test } from "node:test";
import { isReadingRouteLocked, isSeasonRoute } from "../src/features/reading/lib/launchSections.ts";

test("students can open the dashboard, book vote, and enabled leaderboard before kickoff", () => {
  for (const route of ["/reading", "/reading/games", "/reading/leaderboard"]) {
    assert.equal(isSeasonRoute(route), false, `${route} must render even while season settings are loading`);
    assert.equal(isReadingRouteLocked(route, false), false, `${route} must be accessible before kickoff`);
    assert.equal(isReadingRouteLocked(route, true), false);
  }
});

test("competition pages remain locked until the season starts", () => {
  for (const route of ["/reading/profile", "/reading/quiz"]) {
    assert.equal(isSeasonRoute(route), true);
    assert.equal(isReadingRouteLocked(route, false), true);
    assert.equal(isReadingRouteLocked(route, true), false);
  }
});

test("team setup and rules are available before kickoff", () => {
  for (const route of ["/reading/team", "/reading/rules", "/reading/settings"]) {
    assert.equal(isReadingRouteLocked(route, false), false);
  }
});
