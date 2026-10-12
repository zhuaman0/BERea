"use client";

import { cn } from "./cn";

interface SwitchProps {
  checked:   boolean;
  onChange:  (checked: boolean) => void;
  label:     string;
  disabled?: boolean;
}

/** An on/off toggle; `label` is its accessible name. */
export function Switch({ checked, onChange, label, disabled = false }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-60",
        checked ? "rd-accent-gradient" : "bg-[var(--rd-border)]"
      )}
    >
      <span
        className={cn(
          "absolute top-1 h-5 w-5 rounded-full bg-white transition-transform",
          checked ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );
}
