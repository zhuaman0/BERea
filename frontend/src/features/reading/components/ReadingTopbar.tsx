import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";

interface ReadingTopbarProps {
  seasonLabel: string;
  roundIndex:  number;
  roundTotal:  number;
  totalPoints: number;
}

export function ReadingTopbar({ seasonLabel, roundIndex, roundTotal, totalPoints }: ReadingTopbarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--rd-border)] bg-[var(--rd-panel)] px-4 md:px-6">
      <Link href={"/reading" as Route} className="flex min-w-0 items-center gap-2.5">
        <Image src="/logo_451.png" alt="451° gradus" width={32} height={32} priority className="h-8 w-8 shrink-0 rounded-full" />
        <span className="font-display truncate text-[14px] font-semibold tracking-tight text-[var(--rd-text)]">
          NATS SPIREA
        </span>
        {roundTotal > 0 && (
          <span className="hidden truncate text-[12px] text-[var(--rd-text-muted)] sm:inline">
            · {seasonLabel} · Round {roundIndex} of {roundTotal}
          </span>
        )}
      </Link>

      <div className="flex shrink-0 items-center gap-3">
        <span className="rd-accent-gradient rounded-full px-3 py-1 text-[12px] font-semibold text-black/80">
          {totalPoints} pts
        </span>
        <div className="h-8 w-8 rounded-full bg-[var(--rd-border)]" />
      </div>
    </header>
  );
}
