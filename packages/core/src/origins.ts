const V1 = "/api/v1" as const;

export const ORIGINS = {
  auth: {
    login:    `${V1}/auth/login`,
    register: `${V1}/auth/register`,
    refresh:  `${V1}/auth/refresh`,
    logout:   `${V1}/auth/logout`,
    me:       `${V1}/auth/me`,
  },
  studySessions: {
    base:   `${V1}/study-sessions`,
    detail: (id: string) => `${V1}/study-sessions/${id}`,
    start:  (id: string) => `${V1}/study-sessions/${id}/start`,
    end:    (id: string) => `${V1}/study-sessions/${id}/end`,
  },
  materials: {
    base:       `${V1}/materials`,
    detail:     (id: string) => `${V1}/materials/${id}`,
    flashcards: (id: string) => `${V1}/materials/${id}/flashcards`,
    testQuestions: (id: string) => `${V1}/materials/${id}/test-questions`,
  },
  personas: {
    base:    `${V1}/personas`,
    detail:  (id: string) => `${V1}/personas/${id}`,
    chat:    (id: string) => `${V1}/personas/${id}/chat`,
  },
  analytics: {
    reports: `${V1}/study-sessions/reports`,
  },
  integrations: {
    youtube: `${V1}/integrations/youtube`,
  },
} as const;
