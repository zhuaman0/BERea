import type { StudyMethod, MaterialType, PersonaTone } from "./api";

export interface StudySession {
  id: string;
  user_id: string;
  method: StudyMethod;
  planned_duration_minutes: number;
  actual_duration_minutes: number | null;
  focus_score: number | null;
  environment_notes: string | null;
  started_at: string;
  ended_at: string | null;
  created_at: string;
}

export interface AnalyticReport {
  id: string;
  period_type: "weekly" | "monthly";
  period_start: string;
  period_end: string;
  total_sessions: number;
  total_minutes_studied: number;
  avg_focus_score: number | null;
  best_method: string | null;
  best_time_of_day: string | null;
}

export interface Material {
  id: string;
  user_id: string;
  type: MaterialType;
  title: string;
  description: string | null;
  source_url: string | null;
  created_at: string;
}

export interface AIPersona {
  id: string;
  name: string;
  tone: PersonaTone;
  description: string;
  avatar_url: string | null;
  is_active: boolean;
}

export interface Flashcard {
  id: string;
  material_id: string;
  front: string;
  back: string;
  sort_order: number;
  ease_factor: number;
  interval_days: number;
  repetitions: number;
}
