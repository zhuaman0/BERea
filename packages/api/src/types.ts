export type SemesterRoundStatus = "done" | "in_progress" | "locked";

export interface SemesterRound {
  id:         string;
  index:      number;
  label:      string;
  starts_at:  string;
  ends_at:    string;
  status:     SemesterRoundStatus;
}

export type VoteStage = "language" | "genre" | "book";

export interface VoteOptionResult {
  id:         string;
  label:      string;
  book_id:    string | null;
  vote_count: number;
  percent:    number;
}

export interface VoteRound {
  id:                  string;
  stage:               VoteStage;
  is_open:             boolean;
  status:              "scheduled" | "open" | "closed";
  is_tied:             boolean;
  opens_at:            string;
  closes_at:           string;
  total_votes:         number;
  options:             VoteOptionResult[];
  winner_option_id:    string | null;
  your_vote_option_id: string | null;
}
