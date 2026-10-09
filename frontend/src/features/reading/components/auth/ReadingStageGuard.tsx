"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useReadingAuthStore } from "@/features/reading/store/useReadingAuthStore";

type Props = {
  /** "require-team": bounce team-less users to onboarding. "require-no-team": bounce users who already have a team away from onboarding. */
  mode: "require-team" | "require-no-team";
};

export function ReadingStageGuard({ mode }: Props) {
  const router = useRouter();
  const user = useReadingAuthStore((s) => s.user);

  useEffect(() => {
    if (!user) return;
    if (mode === "require-team" && !user.team_name) {
      router.replace("/reading/join-team");
    }
    if (mode === "require-no-team" && user.team_name) {
      router.replace("/reading");
    }
  }, [mode, router, user]);

  return null;
}
