import type { ReadingBook } from "./bookTypes";

export interface ReadingUser {
  id:             string;
  email:          string;
  full_name:      string;
  team_name:      string | null;
  payment_status: string | null;
  token_balance:  number;
  current_streak: number;
  is_admin:       boolean;
  is_tester:      boolean;
  is_captain:     boolean;
  created_at:     string;
  /** Bumps whenever the profile photo changes; null when there is no photo. */
  avatar_version: number | null;
}

export interface ReadingShelfEntry {
  book:         ReadingBook;
  current_page: number;
  updated_at:   string;
}

export interface ReadingProfileStats {
  quiz_points:     number;
  quiz_nights:     number;
  answers_total:   number;
  answers_correct: number;
  votes_cast:      number;
  pages_read:      number;
  books_finished:  number;
  shelf:           ReadingShelfEntry[];
}

export interface ReadingTokenResponse {
  access_token:  string;
  refresh_token: string;
  token_type:    string;
}

export interface ReadingLoginRequest {
  email:    string;
  password: string;
}

export interface ReadingRegisterRequest {
  full_name: string;
  email:     string;
  password:  string;
}

export interface ReadingTeamJoinRequest {
  team_name: string;
}

export interface ReadingTeamMember {
  id:             string;
  full_name:      string;
  email:          string;
  current_streak: number;
  active_today:   boolean;
  is_captain:     boolean;
  created_at:     string;
  avatar_version: number | null;
}

export type CoverColor = "ember" | "crimson" | "ocean" | "forest" | "plum" | "midnight" | "parchment";
export type CoverPattern = "plain" | "stripes" | "dots" | "lines";
export type CoverEmblem = "monogram" | "flame" | "star" | "feather" | "crown" | "moon";
export type CoverAnimation = "float" | "glow" | "still";

export interface TeamCover {
  title:     string | null;
  color:     CoverColor;
  pattern:   CoverPattern;
  emblem:    CoverEmblem;
  animation: CoverAnimation;
}

export interface ReadingTeam {
  id:          string;
  name:        string;
  members:     ReadingTeamMember[];
  max_members:    number;
  points:         number;
  books_finished: number;
  place:          number;
  teams_total: number;
  cover:       TeamCover;
}

export interface ReadingTeamSummary {
  id:           string;
  name:         string;
  member_count: number;
  points:       number;
  cover:        TeamCover;
}

export interface ReadingTeamInvite {
  token:      string;
  expires_at: string;
}

export interface ReadingTeamInvitePreview {
  team_name:    string;
  captain_name: string | null;
  member_count: number;
  max_members:  number;
}

export interface ReadingTeamMemberProfile {
  id:              string;
  full_name:       string;
  email:           string;
  team_name:       string;
  current_streak:  number;
  token_balance:   number;
  created_at:      string;
  avatar_version:  number | null;
}
