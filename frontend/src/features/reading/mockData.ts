import type { ReadingDashboard } from "./types";

/**
 * Placeholder data — the "reading" backend domain doesn't exist yet.
 * Shapes mirror what services/repositories will return once wired up,
 * so swapping this for a real readingApi.ts is a drop-in change.
 */

export const MOCK_DASHBOARD: ReadingDashboard = {
  greetingName: "Alish",
  greetingNote: "Keep reading — every page you log adds to your team's score.",
  quizNight: {
    daysLeft:    6,
    hoursLeft:   23,
    minutesLeft: 59,
    dateLabel:   "31 October · 19:00",
    location:    "Block C, Auditorium 204 · 14 teams",
    teamsCount:  14,
    entryNote:   "Entry: 1 game token or semester pass",
  },
  bonusTasks: [
    { id: "b1", title: "30s TikTok review",       points: 150, status: "open", note: "×2 points in the next round" },
    { id: "b2", title: "Quote card on Instagram", points: 80,  status: "open", note: "+20 flat points, once per month" },
    { id: "b3", title: "Bring a new player",      points: 0,   status: "done", note: "Claimed on 12 Oct" },
  ],
};
