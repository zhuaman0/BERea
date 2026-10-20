"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ShieldAlert } from "lucide-react";
import { readingAuthApi } from "@berea/api";
import { useReadingAuthStore } from "@/features/reading/store/useReadingAuthStore";

type GateStatus = "checking" | "allowed" | "denied";

interface AdminGateProps {
  children: React.ReactNode;
}

/** UI guard for the admin panel. The backend enforces the same rule on every admin endpoint. */
export function AdminGate({ children }: AdminGateProps) {
  const updateUser = useReadingAuthStore((s) => s.updateUser);
  const [status, setStatus] = useState<GateStatus>("checking");
  const t = useTranslations("reading.admin.gate");

  useEffect(() => {
    readingAuthApi
      .me()
      .then((user) => {
        updateUser(user);
        setStatus(user.is_admin ? "allowed" : "denied");
      })
      .catch(() => setStatus("denied"));
  }, [updateUser]);

  if (status === "checking") {
    return <div className="m-8 h-40 max-w-3xl animate-pulse rounded-2xl bg-[var(--rd-panel)]" aria-label={t("checking")} />;
  }

  if (status === "denied") {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="max-w-sm text-center">
          <ShieldAlert size={32} className="mx-auto text-[var(--rd-accent-from)]" />
          <h1 className="mt-4 font-display text-xl font-semibold text-[var(--rd-text)]">{t("title")}</h1>
          <p className="mt-2 text-sm text-[var(--rd-text-muted)]">
            {t("body")}
          </p>
          <Link
            href="/reading"
            className="rd-accent-gradient mt-5 inline-block rounded-lg px-4 py-2 text-sm font-semibold text-black/85"
          >
            {t("back")}
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
