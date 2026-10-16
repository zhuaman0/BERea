import type { ReactNode } from "react";

interface ReadingSectionHeadingProps {
  eyebrow: string;
  title:   ReactNode;
  id?:     string;
  aside?:  ReactNode;
}

/** Orange uppercase eyebrow + display title, used above every section below the hero. */
export function ReadingSectionHeading({ eyebrow, title, id, aside }: ReadingSectionHeadingProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--rd-accent-from)]">{eyebrow}</p>
        <h2 id={id} className="font-display mt-1 text-2xl font-semibold tracking-tight sm:text-3xl text-[var(--rd-text)]">{title}</h2>
      </div>
      {aside && <div className="text-xs text-[var(--rd-text-muted)]">{aside}</div>}
    </div>
  );
}
