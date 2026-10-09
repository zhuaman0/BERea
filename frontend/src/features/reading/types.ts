export interface TeamMember {
  id:     string;
  name:   string;
  handle: string;
  online: boolean;
}

export interface Team {
  id:      string;
  name:    string;
  place:   number;
  members: TeamMember[];
}

export interface BookOfMonth {
  id:                  string;
  title:               string;
  monthLabel:          string;
  chosenByPercent:     number;
  pageCount:           number;
  yourPage:            number;
  yourProgressPercent: number;
  teamAveragePercent:  number;
}

export interface QuizNight {
  daysLeft:    number;
  hoursLeft:   number;
  minutesLeft: number;
  dateLabel:   string;
  location:    string;
  teamsCount:  number;
  entryNote:   string;
}

export type SemesterMonthStatus = "done" | "in_progress" | "locked";

export interface SemesterMonth {
  index:      number;
  label:      string;
  status:     SemesterMonthStatus;
  points:     number | null;
}

export type BonusTaskStatus = "open" | "done";

export interface BonusTask {
  id:     string;
  title:  string;
  points: number;
  status: BonusTaskStatus;
  note:   string;
}

export interface DashboardStats {
  teamPlace:         number;
  teamsTotal:        number;
  teamPlaceDelta:    string;
  yourPoints:        number;
  pointsBreakdown:   string;
  booksFinished:     number;
  booksTotal:        number;
  lastBookLabel:     string;
  readingStreakDays: number;
  streakNote:        string;
}

export interface ReadingDashboard {
  seasonLabel:  string;
  monthIndex:   number;
  monthTotal:   number;
  totalPoints:  number;
  greetingName: string;
  greetingNote: string;
  book:         BookOfMonth;
  quizNight:    QuizNight;
  stats:        DashboardStats;
  semesterMap:  SemesterMonth[];
  bonusTasks:   BonusTask[];
  team:         Team;
}

export type VoteStage = "language" | "genre" | "book";

export interface VoteOptionResult {
  id:         string;
  label:      string;
  vote_count: number;
  percent:    number;
}

export interface VoteRound {
  id:                  string;
  stage:               VoteStage;
  is_open:             boolean;
  opens_at:            string;
  closes_at:           string;
  total_votes:         number;
  options:             VoteOptionResult[];
  winner_option_id:    string | null;
  your_vote_option_id: string | null;
}

export interface ProfileBadge {
  id:     string;
  label:  string;
  earned: boolean;
}

export interface ProfileStats {
  totalPoints: number;
  quizNights:  number;
  roundsWon:   number;
  accuracy:    number;
  boardPlace:  number;
  boardTotal:  number;
}

export interface ReadingProfile {
  name:            string;
  handle:          string;
  teamName:        string;
  memberSince:     string;
  tokenBalance:    number;
  stats:           ProfileStats;
  readingLogLabel: string;
  yourProgress:    number;
  teammates:       { name: string; progress: number }[];
  badges:          ProfileBadge[];
  activityDays:    number[];
}
