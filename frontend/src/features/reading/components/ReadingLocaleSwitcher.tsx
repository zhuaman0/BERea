"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { cn } from "@/shared/lib/utils";
import { setLocale } from "@/i18n/actions";

const LOCALES = [
  { code: "en", label: "EN", name: "English" },
  { code: "ru", label: "RU", name: "Русский" },
  { code: "kk", label: "KZ", name: "Қазақша" },
] as const;

interface ReadingLocaleSwitcherProps {
  className?: string;
}

export function ReadingLocaleSwitcher({ className }: ReadingLocaleSwitcherProps) {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleChange(code: string) {
    if (code === locale) return;
    startTransition(async () => {
      await setLocale(code);
      router.refresh();
    });
  }

  return (
    <div
      role="group"
      aria-label="Language"
      className={cn("flex items-center gap-0.5 rounded-full border border-[var(--rd-border)] bg-[var(--rd-ink)]/60 p-0.5", className)}
    >
      {LOCALES.map(({ code, label, name }) => {
        const isActive = locale === code;
        return (
          <button
            key={code}
            type="button"
            lang={code}
            title={name}
            aria-pressed={isActive}
            onClick={() => handleChange(code)}
            disabled={isPending}
            className={cn(
              "rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide transition-colors disabled:opacity-60",
              isActive
                ? "rd-accent-gradient text-[#1a0e05]"
                : "text-[var(--rd-text-muted)] hover:text-[var(--rd-text)]"
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
