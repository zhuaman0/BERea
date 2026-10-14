import { readingApiClient } from "./readingApiClient";
import type {
  ReadingLoginRequest,
  ReadingProfileStats,
  ReadingRegisterRequest,
  ReadingTeam,
  ReadingTeamJoinRequest,
  ReadingTeamInvite,
  ReadingTeamInvitePreview,
  ReadingTeamMemberProfile,
  ReadingTeamSummary,
  ReadingTokenResponse,
  ReadingUser,
  TeamCover,
} from "./authTypes";

export const readingAuthApi = {
  login: (body: ReadingLoginRequest) =>
    readingApiClient.post<ReadingTokenResponse>("/v1/reading/auth/login", body),

  register: (body: ReadingRegisterRequest) =>
    readingApiClient.post<ReadingTokenResponse>("/v1/reading/auth/register", body),

  logout: (refreshToken: string) =>
    readingApiClient.post<void>("/v1/reading/auth/logout", { refresh_token: refreshToken }),

  me: () => readingApiClient.get<ReadingUser>("/v1/reading/users/me"),

  myStats: () => readingApiClient.get<ReadingProfileStats>("/v1/reading/users/me/stats"),

  verifyEmail: (code: string) =>
    readingApiClient.post<ReadingUser>("/v1/reading/auth/verify-email", { code }),

  resendCode: () => readingApiClient.post<void>("/v1/reading/auth/resend-code", {}),

  createTeam: (body: ReadingTeamJoinRequest) =>
    readingApiClient.post<ReadingUser>("/v1/reading/teams", body),

  joinTeam: (inviteToken: string) =>
    readingApiClient.post<ReadingUser>("/v1/reading/teams/join", { invite_token: inviteToken }),

  previewInvite: (inviteToken: string) =>
    readingApiClient.get<ReadingTeamInvitePreview>(`/v1/reading/teams/invites/${encodeURIComponent(inviteToken)}`),

  teamInvite: () => readingApiClient.post<ReadingTeamInvite>("/v1/reading/teams/me/invite", {}),

  myTeam: () => readingApiClient.get<ReadingTeam>("/v1/reading/teams/me"),

  listTeams: () => readingApiClient.get<ReadingTeamSummary[]>("/v1/reading/teams"),

  renameTeam: (body: ReadingTeamJoinRequest) =>
    readingApiClient.patch<ReadingTeam>("/v1/reading/teams/me", body),

  updateTeamCover: (body: TeamCover) =>
    readingApiClient.put<ReadingTeam>("/v1/reading/teams/me/cover", body),

  teamMemberProfile: (memberId: string) =>
    readingApiClient.get<ReadingTeamMemberProfile>(`/v1/reading/teams/members/${memberId}`),
};
