import { Check } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { PAYMENT_STEP_ENABLED } from "@/features/reading/lib/paymentStatus";

const STEPS: readonly string[] = PAYMENT_STEP_ENABLED ? ["Account", "Team", "Payment"] : ["Account", "Team"];

export function RegistrationSteps({ current }: { current: 1 | 2 | 3 }) {
  return (
    <ol className="flex items-center" aria-label={`Registration step ${current} of ${STEPS.length}`}>
      {STEPS.map((label, index) => {
        const step = index + 1;
        const isDone = step < current;
        const isCurrent = step === current;

        return (
          <li key={label} className={cn("flex items-center", index < STEPS.length - 1 && "flex-1")}>
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full border text-[11px] font-semibold",
                  isDone && "border-[var(--rd-accent-from)] bg-[var(--rd-accent-from)] text-[#1a0e05]",
                  isCurrent && "border-[var(--rd-accent-from)] text-[var(--rd-accent-from)]",
                  !isDone && !isCurrent && "border-[var(--rd-border)] text-[var(--rd-text-muted)]"
                )}
                aria-current={isCurrent ? "step" : undefined}
              >
                {isDone ? <Check size={14} /> : step}
              </span>
              <span className={cn("text-[10px]", isCurrent ? "text-[var(--rd-text)]" : "text-[var(--rd-text-muted)]")}>
                {label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <span className={cn("mx-2 mb-5 h-px flex-1", isDone ? "bg-[var(--rd-accent-from)]" : "bg-[var(--rd-border)]")} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
