import type { LucideIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface StatTileProps {
  label: string;
  value: string;
  note?: string;
  size?: "md" | "lg";
  icon?: LucideIcon;
  accent?: boolean;
}

export function StatTile({ label, value, note, size = "md", icon: Icon, accent = false }: StatTileProps) {
  const isLg = size === "lg";

  return (
    <div
      className={cn(
        "border border-[var(--rd-border)] bg-[var(--rd-panel)] transition-colors hover:border-[var(--rd-accent-from)]/40",
        isLg ? "rounded-2xl p-6" : "rounded-xl p-4"
      )}
    >
      <div className="flex items-center justify-between">
        <p className={isLg ? "text-[13px] text-[var(--rd-text-muted)]" : "text-[11px] text-[var(--rd-text-muted)]"}>
          {label}
        </p>
        {Icon && (
          <span
            className={cn(
              "flex shrink-0 items-center justify-center rounded-full",
              isLg ? "h-8 w-8" : "h-6 w-6",
              accent
                ? "rd-accent-gradient text-[#1a0e05]"
                : "border border-[var(--rd-border)] text-[var(--rd-accent-from)]"
            )}
          >
            <Icon size={isLg ? 16 : 13} />
          </span>
        )}
      </div>
      <p
        className={cn(
          "font-display font-semibold",
          isLg ? "mt-2 text-4xl" : "mt-1 text-2xl",
          accent
            ? "bg-gradient-to-r from-[var(--rd-accent-from)] to-[var(--rd-accent-to)] bg-clip-text text-transparent"
            : "text-[var(--rd-text)]"
        )}
      >
        {value}
      </p>
      {note && (
        <p className={isLg ? "mt-1.5 text-[13px] text-[var(--rd-text-muted)]" : "mt-1 text-[11px] text-[var(--rd-text-muted)]"}>
          {note}
        </p>
      )}
    </div>
  );
}
