import { apiClient } from "@/shared/lib/api-client";
import type { StudySession, AnalyticReport } from "@/types/study";
import type { StudyMethod } from "@/types/api";

export interface StartSessionPayload {
  method: StudyMethod;
  planned_duration_minutes: number;
  material_id?: string;
  persona_id?: string;
  started_at: string;
  environment_notes?: string;
}

export interface EndSessionPayload {
  actual_duration_minutes: number;
  focus_score?: number;
  ended_at: string;
}

export const studySessionsApi = {
  start: (body: StartSessionPayload) =>
    apiClient.post<StudySession>("/v1/study-sessions/", body),

  end: (sessionId: string, body: EndSessionPayload) =>
    apiClient.patch<StudySession>(`/v1/study-sessions/${sessionId}/end`, body),

  list: () =>
    apiClient.get<StudySession[]>("/v1/study-sessions/"),

  weeklyAnalytics: () =>
    apiClient.get<AnalyticReport[]>("/v1/study-sessions/analytics/weekly"),

  monthlyAnalytics: () =>
    apiClient.get<AnalyticReport[]>("/v1/study-sessions/analytics/monthly"),
};
