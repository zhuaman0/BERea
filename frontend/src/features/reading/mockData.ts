import type {
  ReadingDashboard,
  ReadingProfile,
} from "./types";

/**
 * Placeholder data — the "reading" backend domain doesn't exist yet.
 * Shapes mirror what services/repositories will return once wired up,
 * so swapping this for a real readingApi.ts is a drop-in change.
 */

export const MOCK_TEAM = {
  id:    "team-1",
  name:  "TEA-ІШЕРС",
  place: 3,
  members: [
    { id: "u1", name: "Alish",  handle: "Alisher Zhunisov", online: true },
    { id: "u2", name: "Nureke", handle: "Sagyndyk Nurzhan", online: true },
    { id: "u3", name: "Yereke", handle: "Yerzhan Ahmet",    online: false },
  ],
};

export const MOCK_DASHBOARD: ReadingDashboard = {
  seasonLabel:  "Fall semester 2026",
  monthIndex:   2,
  monthTotal:   4,
  totalPoints:  136,
  greetingName: "Alish",
  greetingNote: "Keep reading — the October quiz night is the last chance to move up two places.",
  book: {
    id:                  "book-oct",
    title:               "Шоко әлем 2",
    monthLabel:          "October",
    chosenByPercent:     41,
    pageCount:           312,
    yourPage:            150,
    yourProgressPercent: 48,
    teamAveragePercent:  51,
  },
  quizNight: {
    daysLeft:    6,
    hoursLeft:   23,
    minutesLeft: 59,
    dateLabel:   "31 October · 19:00",
    location:    "Block C, Auditorium 204 · 14 teams",
    teamsCount:  14,
    entryNote:   "Entry: 1 game token or semester pass",
  },
  stats: {
    teamPlace:         3,
    teamsTotal:        14,
    teamPlaceDelta:    "▲ 2 since September",
    yourPoints:        136,
    pointsBreakdown:   "64 from quizzes · 72 reading",
    booksFinished:     1,
    booksTotal:        4,
    lastBookLabel:     "September: Ұшқан ұя",
    streakNote:        "+5 pts per 7-day streak",
  },
  bonusTasks: [
    { id: "b1", title: "30s TikTok review",       points: 150, status: "open", note: "×2 points in the next round" },
    { id: "b2", title: "Quote card on Instagram", points: 80,  status: "open", note: "+20 flat points, once per month" },
    { id: "b3", title: "Bring a new player",      points: 0,   status: "done", note: "Claimed on 12 Oct" },
  ],
  team: MOCK_TEAM,
};

export const MOCK_PROFILE: ReadingProfile = {
  name:            "Alisher Zhunisov",
  handle:          "@alish",
  teamName:        "TEA-ІШЕРС",
  memberSince:     "member since Oct 2023",
  tokenBalance:    1000,
  stats: {
    totalPoints: 136,
    quizNights:  2,
    roundsWon:   23,
    accuracy:    64,
    boardPlace:  9,
    boardTotal:  142,
  },
  readingLogLabel: "Шоко әлем 2",
  yourProgress:    48,
  teammates: [
    { name: "Nureke", progress: 32 },
    { name: "Yereke",  progress: 73 },
  ],
  badges: [
    { id: "first-finish",    label: "First finish",    current: 1,   target: 1   },
    { id: "streak-9",        label: "9-day streak",    current: 9,   target: 9   },
    { id: "tiktok-3",        label: "TikTok ×3",       current: 3,   target: 3   },
    { id: "point-collector", label: "250 points",      current: 136, target: 250 },
    { id: "all-4-books",     label: "All 4 books",     current: 1,   target: 4   },
    { id: "perfect-round",   label: "Perfect round",   current: 0,   target: 1   },
    { id: "semester-winner", label: "Semester winner", current: 0,   target: 1   },
  ],
  activityDays: [2, 3, 1, 4, 2, 5, 3, 1, 0, 4, 6, 2, 3, 5],
};
