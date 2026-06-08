"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { usersApi } from "@/features/users/api";
import type { User } from "@/types/auth";

function Spinner() {
  const t = useTranslations("callback");
  return (
    <div className="flex flex-col items-center gap-5 py-4">
      <div
        className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-500"
        role="status"
        aria-label="Loading"
      />
      <div className="text-center">
        <h1 className="text-lg font-semibold text-slate-900">{t("signingIn")}</h1>
        <p className="mt-1 text-sm text-slate-500">{t("pleaseWait")}</p>
      </div>
    </div>
  );
}

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSession, updateUser } = useAuthStore();

  useEffect(() => {
    const access_token  = searchParams.get("access_token");
    const refresh_token = searchParams.get("refresh_token");
    const error         = searchParams.get("error");

    if (error || !access_token || !refresh_token) {
      router.replace("/login?error=google_auth_failed");
      return;
    }

    const placeholder: User = {
      id: "", email: "", full_name: "", avatar_url: null,
      is_active: true, is_verified: true, current_streak: 0,
      longest_streak: 0, last_study_date: null, created_at: new Date().toISOString(),
    };

    setSession(placeholder, access_token, refresh_token);
    document.cookie = "berea-session=1; path=/; SameSite=Lax";

    usersApi
      .me()
      .then((profile) => {
        updateUser(profile);
        router.replace("/dashboard");
      })
      .catch(() => {
        router.replace("/dashboard");
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <Spinner />;
}

export default function CallbackPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <CallbackHandler />
    </Suspense>
  );
}
