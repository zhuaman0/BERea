import { cn } from "@/shared/lib/utils";
import type { PersonaTone } from "@/types/api";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | PersonaTone;

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  default:  "bg-gray-100 text-gray-700",
  success:  "bg-green-100 text-green-700",
  warning:  "bg-amber-100 text-amber-700",
  danger:   "bg-red-100 text-red-700",
  info:     "bg-blue-100 text-blue-700",
  kind:     "bg-green-100 text-green-700",
  tough:    "bg-amber-100 text-amber-700",
  intense:  "bg-red-100 text-red-700",
};

export function Badge({ variant = "default", className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
