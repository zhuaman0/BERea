export interface ReadingUser {
  id:             string;
  email:          string;
  full_name:      string;
  team_name:      string | null;
  token_balance:  number;
  current_streak: number;
  created_at:     string;
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
  created_at:     string;
}

export interface ReadingTeam {
  id:          string;
  name:        string;
  members:     ReadingTeamMember[];
  max_members: number;
  place:       number;
  teams_total: number;
}

export interface ReadingTeamSummary {
  id:           string;
  name:         string;
  member_count: number;
}

export interface ReadingTeamMemberAddRequest {
  full_name: string;
  email:     string;
}

export interface ReadingTeamMemberProfile {
  id:              string;
  full_name:       string;
  email:           string;
  team_name:       string;
  current_streak:  number;
  token_balance:   number;
  created_at:      string;
}
