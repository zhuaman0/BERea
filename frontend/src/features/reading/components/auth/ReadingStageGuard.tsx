"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { readingAuthApi } from "@berea/api";
import { useReadingAuthStore } from "@/features/reading/store/useReadingAuthStore";
import { hasSubmittedPayment } from "@/features/reading/lib/paymentStatus";
import { nextReadingStage } from "@/features/reading/lib/nextStage";

type Props = {
  mode: "require-team" | "require-no-team" | "require-unpaid-team";
};

export function ReadingStageGuard({ mode }: Props) {
  const router = useRouter();
  const user = useReadingAuthStore((s) => s.user);
  const updateUser = useReadingAuthStore((s) => s.updateUser);

  useEffect(() => {
    if (!user) return;
    if (user.payment_status === undefined) {
      readingAuthApi.me().then(updateUser).catch(() => { /* API client handles expired sessions */ });
      return;
    }
    const invite = new URLSearchParams(window.location.search).get("invite");
    const hasPaid = hasSubmittedPayment(user.payment_status);

    if (!user.team_name && mode !== "require-no-team") router.replace(nextReadingStage(user, invite));
    if (mode === "require-team" && user.team_name && !hasPaid) router.replace("/reading/payment");
    if (mode === "require-no-team" && user.team_name) router.replace(nextReadingStage(user));
    if (mode === "require-unpaid-team" && user.team_name && hasPaid) router.replace("/reading");
  }, [mode, router, updateUser, user]);

  return null;
}
