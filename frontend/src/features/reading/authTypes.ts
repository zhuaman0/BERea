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
  id:        string;
  full_name: string;
  email:     string;
}

export interface ReadingTeam {
  id:          string;
  name:        string;
  members:     ReadingTeamMember[];
  max_members: number;
}

export interface ReadingTeamSummary {
  id:           string;
  name:         string;
  member_count: number;
}
