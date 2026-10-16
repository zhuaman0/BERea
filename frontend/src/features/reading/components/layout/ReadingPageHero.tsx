import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface ReadingPageHeroProps {
  eyebrow:      string;
  eyebrowIcon:  LucideIcon;
  title:        ReactNode;
  accent?:      ReactNode;
  description?: ReactNode;
  leading?:     ReactNode;
  aside?:       ReactNode;
  footer?:      ReactNode;
  className?:   string;
}

/** The page header every reading page opens with — see `.claude/skills/reading-design`. */
export function ReadingPageHero({
  eyebrow,
  eyebrowIcon: EyebrowIcon,
  title,
  accent,
  description,
  leading,
  aside,
  footer,
  className,
}: ReadingPageHeroProps) {
  return (
    <header className={cn("relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-[var(--rd-panel)] px-5 py-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:px-8 sm:py-8 lg:px-10 lg:py-10", className)}>
      <div className="rd-hero-glow pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
      <div className="rd-hero-grid pointer-events-none absolute inset-0 opacity-[0.035]" aria-hidden="true" />

      <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="flex min-w-0 max-w-3xl flex-col gap-5 sm:flex-row sm:items-end">
          {leading && <div className="shrink-0">{leading}</div>}
          <div className="min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--rd-accent-from)]/25 bg-[var(--rd-accent-from)]/[0.08] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--rd-accent-to)]">
            <EyebrowIcon size={12} aria-hidden="true" />
            {eyebrow}
          </div>
          <h1 className="font-display mt-5 break-words text-[clamp(2.2rem,6vw,4.25rem)] font-semibold leading-[0.95] tracking-[-0.05em] text-[var(--rd-text)]">
            {title}
            {accent && (
              <span className="block bg-gradient-to-r from-[var(--rd-accent-from)] to-[var(--rd-accent-to)] bg-clip-text text-transparent">
                {accent}
              </span>
            )}
          </h1>
          {description && (
            <p className="mt-5 max-w-xl text-sm leading-6 text-[var(--rd-text-muted)] sm:text-[15px]">{description}</p>
          )}
          </div>
        </div>

        {aside && <div className="flex flex-col gap-4 lg:items-end">{aside}</div>}
      </div>

      {footer && (
        <div className="relative mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/[0.06] pt-4 text-[11px] text-[var(--rd-text-muted)] sm:mt-10">
          {footer}
        </div>
      )}
    </header>
  );
}
