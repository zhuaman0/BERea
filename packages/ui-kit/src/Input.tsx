import type { InputHTMLAttributes } from "react";
import { clsx } from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, id, className, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-[var(--rd-text)]">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={clsx(
          "h-12 w-full rounded-xl border px-3.5 text-sm",
          "bg-[var(--rd-panel)] text-[var(--rd-text)] placeholder:text-[var(--rd-text-muted)]",
          "outline-none transition-colors",
          error
            ? "border-red-400 focus:border-red-400"
            : "border-[var(--rd-border)] focus:border-[var(--rd-accent-from)]",
          className,
        )}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-xs text-red-400" role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${inputId}-hint`} className="text-xs text-[var(--rd-text-muted)]">
          {hint}
        </p>
      )}
    </div>
  );
}
