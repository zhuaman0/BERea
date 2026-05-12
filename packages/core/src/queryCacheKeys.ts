export const cacheKeys = {
  auth: {
    me: () => ["auth", "me"] as const,
  },

  studySessions: {
    all:    () => ["studySessions"] as const,
    lists:  () => ["studySessions", "list"] as const,
    list:   (filters?: Record<string, unknown>) => ["studySessions", "list", filters] as const,
    detail: (id: string) => ["studySessions", "detail", id] as const,
  },

  materials: {
    all:           () => ["materials"] as const,
    lists:         () => ["materials", "list"] as const,
    list:          (filters?: Record<string, unknown>) => ["materials", "list", filters] as const,
    detail:        (id: string) => ["materials", "detail", id] as const,
    flashcards:    (id: string) => ["materials", id, "flashcards"] as const,
    testQuestions: (id: string) => ["materials", id, "testQuestions"] as const,
  },

  personas: {
    all:    () => ["personas"] as const,
    list:   () => ["personas", "list"] as const,
    detail: (id: string) => ["personas", "detail", id] as const,
  },

  analytics: {
    all:     () => ["analytics"] as const,
    reports: () => ["analytics", "reports"] as const,
    report:  (period: "weekly" | "monthly") => ["analytics", "reports", period] as const,
  },
} as const;
