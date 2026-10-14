import { Flame } from "lucide-react";
import { SEASON_RULES } from "@/features/reading/lib/seasonRules";

export function LandingRulesSection() {
  return (
    <section id="rules" className="border-t border-white/5 px-6 py-24 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <span className="block text-center text-xs uppercase tracking-[0.3em] text-[var(--rd-text-muted)]">
          How to play
        </span>
        <h2 className="font-display mt-3 text-center text-3xl font-semibold text-[var(--rd-text)] sm:text-4xl">
          The six rules
        </h2>

        <div className="mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-2">
          {SEASON_RULES.map((rule, index) => {
            const ruleNumber = String(index + 1).padStart(2, "0");
            return (
              <div
                key={rule.title}
                className="group relative overflow-hidden rounded-2xl border border-[var(--rd-border)] bg-[var(--rd-panel)] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--rd-accent-from)]/50"
              >
                <span
                  className="font-display pointer-events-none absolute -right-2 -top-4 select-none text-7xl font-bold leading-none text-white/[0.04] transition-colors duration-300 group-hover:text-[var(--rd-accent-from)]/10"
                  aria-hidden="true"
                >
                  {ruleNumber}
                </span>

                <div className="relative flex items-start gap-4">
                  <span className="rd-accent-gradient flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#1a0e05]">
                    <rule.icon size={18} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--rd-text-muted)]">
                      Rule {ruleNumber}
                    </p>
                    <p className="font-display mt-1 text-[17px] font-semibold text-[var(--rd-text)]">{rule.title}</p>
                    <p className="mt-2 text-[13px] leading-relaxed text-[var(--rd-text-muted)]">{rule.body}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="relative mx-auto mt-6 max-w-2xl overflow-hidden rounded-[28px] border border-[var(--rd-accent-from)]/40 bg-[var(--rd-panel)] px-10 py-14 text-center">
          <Flame
            size={140}
            className="pointer-events-none absolute -left-8 -top-8 text-[var(--rd-accent-from)]/[0.08]"
            aria-hidden="true"
          />
          <Flame
            size={140}
            className="pointer-events-none absolute -bottom-8 -right-8 text-[var(--rd-accent-from)]/[0.08]"
            aria-hidden="true"
          />
          <span className="rd-accent-gradient relative mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full shadow-[0_0_40px_-5px_rgba(255,107,44,0.8)]">
            <Flame size={24} className="text-[#1a0e05]" />
          </span>
          <p className="font-display relative bg-gradient-to-r from-[var(--rd-accent-from)] to-[var(--rd-accent-to)] bg-clip-text text-2xl font-bold leading-snug text-transparent sm:text-3xl">
            Today a reader, tomorrow a leader.
          </p>
          <p className="relative mt-3 text-sm text-[var(--rd-text-muted)]">Six rules. One fuse. Light it.</p>
        </div>
      </div>
    </section>
  );
}
