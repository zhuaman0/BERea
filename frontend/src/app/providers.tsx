"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Don't refetch on window focus during dev — very noisy
        refetchOnWindowFocus: process.env.NODE_ENV === "production",
        staleTime: 60 * 1000, // 1 min
        retry: 1,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

// Singleton for server — prevents creating a new client on every RSC render
let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === "undefined") return makeQueryClient();
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}

export function Providers({ children }: { children: React.ReactNode }) {
  // useState ensures the client is only created once per component mount
  const [queryClient] = useState(() => getQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
