import { readingApiClient } from "./readingApiClient";
import type {
  ReadingLoginRequest,
  ReadingRegisterRequest,
  ReadingTeam,
  ReadingTeamJoinRequest,
  ReadingTeamMemberAddRequest,
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

  joinTeam: (body: ReadingTeamJoinRequest) =>
    readingApiClient.post<ReadingUser>("/v1/reading/teams/join", body),

  myTeam: () => readingApiClient.get<ReadingTeam>("/v1/reading/teams/me"),

  listTeams: () => readingApiClient.get<ReadingTeamSummary[]>("/v1/reading/teams"),

  renameTeam: (body: ReadingTeamJoinRequest) =>
    readingApiClient.patch<ReadingTeam>("/v1/reading/teams/me", body),

  updateTeamCover: (body: TeamCover) =>
    readingApiClient.put<ReadingTeam>("/v1/reading/teams/me/cover", body),

  teamMemberProfile: (memberId: string) =>
    readingApiClient.get<ReadingTeamMemberProfile>(`/v1/reading/teams/members/${memberId}`),

  addTeamMember: (body: ReadingTeamMemberAddRequest) =>
    readingApiClient.post<ReadingTeam>("/v1/reading/teams/members", body),
};
