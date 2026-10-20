import type { QuizFormat } from "@berea/api";

const SESSION_KEY = "nats-live-quiz-session";
// Remembers which live quiz the invite popup was closed for, so it doesn't reopen on every page.
const DISMISSED_KEY = "nats-live-quiz-dismissed";

export interface JoinedSession {
  id:     string;
  format: QuizFormat;
}

/** Saved as "<format>:<id>"; a bare id is an instant quiz saved before quiz nights existed. */
export function parseJoinedSession(saved: string | null): JoinedSession | null {
  if (!saved) return null;
  const [format, id] = saved.includes(":") ? saved.split(":", 2) : ["instant", saved];
  return { id, format: format === "rounds" ? "rounds" : "instant" };
}

export function serializeJoinedSession(session: JoinedSession): string {
  return `${session.format}:${session.id}`;
}

function read(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string | null): void {
  try {
    if (value === null) sessionStorage.removeItem(key);
    else sessionStorage.setItem(key, value);
  } catch {
    /* storage unavailable — the page keeps working from memory */
  }
}

export function readJoinedSession(): string | null {
  return read(SESSION_KEY);
}

export function saveJoinedSession(session: JoinedSession | null): void {
  write(SESSION_KEY, session ? serializeJoinedSession(session) : null);
}

export function readDismissedInvite(): string | null {
  return read(DISMISSED_KEY);
}

export function dismissInvite(sessionId: string): void {
  write(DISMISSED_KEY, sessionId);
}
