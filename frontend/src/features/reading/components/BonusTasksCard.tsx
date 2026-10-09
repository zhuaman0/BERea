import { Check, Gift } from "lucide-react";
import type { BonusTask } from "@/features/reading/types";

interface BonusTasksCardProps {
  tasks: BonusTask[];
}

export function BonusTasksCard({ tasks }: BonusTasksCardProps) {
  const openCount = tasks.filter((task) => task.status === "open").length;

  return (
    <div className="rounded-2xl border border-[var(--rd-border)] bg-[var(--rd-panel)] p-7">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-base font-medium text-[var(--rd-text)]">Bonus tasks open</p>
        <span className="text-sm text-[var(--rd-text-muted)]">{openCount} of {tasks.length} left</span>
      </div>

      <div className="flex flex-col gap-4">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-center gap-4">
            <span
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${
                task.status === "done"
                  ? "bg-emerald-400/15"
                  : "border border-[var(--rd-accent-from)]/30 bg-[var(--rd-ink)]"
              }`}
            >
              {task.status === "done" ? (
                <Check size={20} className="text-emerald-400" />
              ) : (
                <Gift size={18} className="text-[var(--rd-accent-from)]" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-[var(--rd-text)]">{task.title}</p>
              <p className="truncate text-xs text-[var(--rd-text-muted)]">{task.note}</p>
            </div>
            <span className="shrink-0 text-sm font-medium text-[var(--rd-text)]">
              {task.status === "done" ? "done" : `${task.points} pts`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
