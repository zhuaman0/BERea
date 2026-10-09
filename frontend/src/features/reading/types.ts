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

export type SemesterRoundStatus = "done" | "in_progress" | "locked";

export interface SemesterRound {
  id:         string;
  index:      number;
  label:      string;
  starts_at:  string;
  ends_at:    string;
  status:     SemesterRoundStatus;
}

export type BonusTaskStatus = "open" | "done";

export interface BonusTask {
  id:     string;
  title:  string;
  points: number;
  status: BonusTaskStatus;
  note:   string;
}

export interface ReadingDashboard {
  greetingName: string;
  greetingNote: string;
  book:         BookOfMonth;
  quizNight:    QuizNight;
  bonusTasks:   BonusTask[];
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

export interface ReadingProfile {
  name:            string;
  handle:          string;
  teamName:        string;
  memberSince:     string;
  tokenBalance:    number;
  readingLogLabel: string;
  yourProgress:    number;
  teammates:       { name: string; progress: number }[];
  activityDays:    number[];
}
