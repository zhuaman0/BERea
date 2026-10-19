import { AlertCircle, LockKeyhole, RefreshCw, Trophy } from "lucide-react";
import { useTranslations } from "next-intl";

type StateVariant = "loading" | "error" | "empty" | "locked";

interface LeaderboardStateProps {
  variant: StateVariant;
  message?: string;
  onRetry?: () => void;
}

export function LeaderboardState({ variant, message, onRetry }: LeaderboardStateProps) {
  const t = useTranslations("reading.leaderboard.state");

  if (variant === "loading") {
    return (
      <div role="status" aria-label={t("loadingLabel")} className="mt-10 space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-80 animate-pulse rounded-[24px] border border-white/[0.06] bg-[var(--rd-panel)]">
              <div className="mx-auto mt-10 h-36 w-28 rounded-xl bg-white/[0.04]" />
              <div className="mx-auto mt-8 h-4 w-1/2 rounded bg-white/[0.05]" />
              <div className="mx-auto mt-4 h-8 w-1/3 rounded bg-white/[0.04]" />
            </div>
          ))}
        </div>
        <div className="h-56 animate-pulse rounded-[24px] border border-white/[0.06] bg-[var(--rd-panel)]" />
        <span className="sr-only">{t("loading")}</span>
      </div>
    );
  }

  const Icon = variant === "error" ? AlertCircle : variant === "locked" ? LockKeyhole : Trophy;
  const Heading = variant === "locked" ? "h1" : "h2";

  return (
    <section role={variant === "error" ? "alert" : "status"} className="relative mt-10 overflow-hidden rounded-[28px] border border-dashed border-white/[0.1] bg-[var(--rd-panel)] px-6 py-16 text-center">
      <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-80 -translate-x-1/2 rounded-full bg-[var(--rd-accent-from)]/10 blur-[70px]" aria-hidden="true" />
      <span className="relative mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--rd-accent-from)]/25 bg-[var(--rd-accent-from)]/10 text-[var(--rd-accent-to)]">
        <Icon size={22} aria-hidden="true" />
      </span>
      <Heading className="font-display relative mt-5 text-2xl font-semibold text-[var(--rd-text)]">{t(`${variant}.title`)}</Heading>
      <p className="relative mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--rd-text-muted)]">{message ?? t(`${variant}.body`)}</p>
      {variant === "error" && onRetry && (
        <button type="button" onClick={onRetry} className="rd-accent-gradient relative mt-6 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold text-black/85 transition hover:brightness-110">
          <RefreshCw size={14} aria-hidden="true" />{t("retry")}
        </button>
      )}
    </section>
  );
}
