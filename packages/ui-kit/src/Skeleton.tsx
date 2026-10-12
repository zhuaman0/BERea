import { cn } from "./cn";

interface SkeletonProps {
  className?: string;
  label?:     string;
}

/** A pulsing placeholder block; size and shape come from `className`. */
export function Skeleton({ className, label }: SkeletonProps) {
  return (
    <div
      aria-label={label}
      aria-busy="true"
      className={cn("animate-pulse rounded-2xl bg-[var(--rd-panel)]", className)}
    />
  );
}
