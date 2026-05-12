import type { HTMLAttributes } from "react";
import { clsx } from "clsx";

const paddings = {
  none: "",
  sm:   "p-4",
  md:   "p-6",
  lg:   "p-8",
} as const;

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: keyof typeof paddings;
}

export function Card({ padding = "md", className, children, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        "bg-surface rounded-card border border-gray-100 shadow-card",
        paddings[padding],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
