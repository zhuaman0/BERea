import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/shared/lib/utils";
import { PAYMENT_STEP_ENABLED } from "@/features/reading/lib/paymentStatus";

type StepKey = "account" | "team" | "payment";

const STEPS: readonly StepKey[] = PAYMENT_STEP_ENABLED ? ["account", "team", "payment"] : ["account", "team"];

export function RegistrationSteps({ current }: { current: 1 | 2 | 3 }) {
  const t = useTranslations("reading.auth.steps");

  return (
    <ol className="flex items-center" aria-label={t("progress", { current, total: STEPS.length })}>
      {STEPS.map((stepKey, index) => {
        const step = index + 1;
        const isDone = step < current;
        const isCurrent = step === current;

        return (
          <li key={stepKey} className={cn("flex items-center", index < STEPS.length - 1 && "flex-1")}>
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
                {t(stepKey)}
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
