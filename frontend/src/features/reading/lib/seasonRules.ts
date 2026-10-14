import { CalendarRange, Crown, Send, Users, Vote, Wallet, type LucideIcon } from "lucide-react";

export const ENTRY_FEE = "3 000 ₸";
export const PAYMENT_PHONE = "87057287996";
export const PAYMENT_PHONE_DISPLAY = "8 705 728 79 96";

export interface SeasonRule {
  title: string;
  body:  string;
  icon:  LucideIcon;
}

export const SEASON_RULES: readonly SeasonRule[] = [
  {
    title: "Entry fee",
    body:  `Taking part costs ${ENTRY_FEE}. Pay by bank transfer and attach the receipt when you register your team.`,
    icon:  Wallet,
  },
  {
    title: "Play as a team",
    body:  "You compete as a team of 3 players. Every point a teammate earns counts toward the team total.",
    icon:  Users,
  },
  {
    title: "Join the Telegram channel",
    body:  "Every participant must subscribe to the 451° Telegram channel. Announcements, votes and quiz dates are posted there.",
    icon:  Send,
  },
  {
    title: "Books are chosen by vote",
    body:  "Players vote on what the league reads next. The book with the most votes becomes the read of the month.",
    icon:  Vote,
  },
  {
    title: "4 months, 4 books, 3 languages",
    body:  "The season runs for one semester: one book each month, with books in three languages across the season.",
    icon:  CalendarRange,
  },
  {
    title: "Highest score wins",
    body:  "At the end of the semester, the team with the most points is crowned the 451° champion.",
    icon:  Crown,
  },
];

export const SEASON_GOALS: readonly string[] = [
  "Build a lasting reading habit among students through gamification.",
  "Grow the number of young people who read.",
  "Bring young people with shared interests together into one community.",
];

export const SEASON_FACTS: readonly { value: string; label: string }[] = [
  { value: "4", label: "Months" },
  { value: "4", label: "Books" },
  { value: "3", label: "Languages" },
  { value: "3", label: "Players per team" },
];
