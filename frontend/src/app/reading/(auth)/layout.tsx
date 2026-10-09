import { BookOpen, Flame, Trophy } from "lucide-react";

const FLAME_PATH =
  "M0,200 L0,65 L43,134 L86,70 L129,166 L171,48 L214,129 L257,79 L300,131 L343,68 L386,162 L429,48 L471,157 L514,58 L557,127 L600,50 L643,152 L686,71 L729,129 L771,60 L814,130 L857,80 L900,152 L943,48 L986,161 L1029,52 L1071,139 L1114,85 L1157,165 L1200,82 L1200,200 Z";

const EMBERS = [
  { left: "10%", size: 3, delay: "0s",   duration: "6s",   drift: "8px" },
  { left: "25%", size: 4, delay: "1.4s", duration: "7.2s", drift: "-10px" },
  { left: "42%", size: 3, delay: "2.6s", duration: "5.6s", drift: "10px" },
  { left: "58%", size: 5, delay: "0.8s", duration: "6.8s", drift: "-8px" },
  { left: "73%", size: 3, delay: "3.2s", duration: "6.2s", drift: "9px" },
  { left: "88%", size: 4, delay: "1.9s", duration: "7.5s", drift: "-11px" },
] as const;

export default function ReadingAuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-y-auto lg:overflow-hidden">
      {/* Form side */}
      <div className="flex w-full flex-col justify-center px-6 py-12 sm:px-12 lg:w-1/2 lg:px-20">
        <div className="mx-auto w-full max-w-[380px]">
          <span className="font-display text-[13px] font-semibold tracking-[0.28em] text-[var(--rd-text-muted)]">
            NATS SPIREA
          </span>
          {children}
        </div>
      </div>

      {/* Decorative side */}
      <div className="relative hidden w-1/2 shrink-0 overflow-hidden bg-[var(--rd-ink)] lg:block">
        {/* ambient smoke */}
        <div className="absolute left-[10%] top-[15%] h-72 w-72 rounded-full bg-[var(--rd-accent-from)]/10 blur-[70px]" aria-hidden="true" />
        <div className="absolute right-[5%] top-[35%] h-80 w-80 rounded-full bg-[var(--rd-accent-to)]/10 blur-[80px]" aria-hidden="true" />

        {/* faint open-book emblem */}
        <svg
          viewBox="0 0 600 320"
          className="absolute bottom-10 left-1/2 h-[280px] w-[520px] -translate-x-1/2 opacity-[0.08]"
          aria-hidden="true"
        >
          <path d="M300,60 C220,40 120,35 20,55 L20,260 C120,240 220,245 300,265 Z" fill="none" stroke="var(--rd-accent-to)" strokeWidth="3" />
          <path d="M300,60 C380,40 480,35 580,55 L580,260 C480,240 380,245 300,265 Z" fill="none" stroke="var(--rd-accent-to)" strokeWidth="3" />
          <line x1="300" y1="60" x2="300" y2="265" stroke="var(--rd-accent-to)" strokeWidth="3" />
        </svg>

        {/* flame silhouette, three layered depths — same motif as the landing hero */}
        <div className="rd-flame-layer rd-flame-back">
          <svg viewBox="0 0 1200 200" preserveAspectRatio="none" className="h-full w-full">
            <path d={FLAME_PATH} fill="var(--rd-accent-from)" />
          </svg>
        </div>
        <div className="rd-flame-layer rd-flame-mid">
          <svg viewBox="0 0 1200 200" preserveAspectRatio="none" className="h-full w-full">
            <defs>
              <linearGradient id="auth-flame-mid-grad" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="var(--rd-accent-from)" />
                <stop offset="100%" stopColor="var(--rd-accent-to)" />
              </linearGradient>
            </defs>
            <path d={FLAME_PATH} fill="url(#auth-flame-mid-grad)" />
          </svg>
        </div>
        <div className="rd-flame-layer rd-flame-front" style={{ transform: "scaleX(-1)" }}>
          <svg viewBox="0 0 1200 200" preserveAspectRatio="none" className="h-full w-full">
            <path d={FLAME_PATH} fill="var(--rd-accent-to)" />
          </svg>
        </div>

        {EMBERS.map((ember, i) => (
          <span
            key={i}
            className="rd-ember"
            style={{
              left:              ember.left,
              width:             ember.size,
              height:            ember.size,
              animationDelay:    ember.delay,
              animationDuration: ember.duration,
              "--rd-ember-drift": ember.drift,
            } as React.CSSProperties}
          />
        ))}

        {/* spotlight vignette so the centered content stays legible over the flame */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 55% at 50% 50%, rgba(11,11,12,0.9), transparent 70%)",
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 flex h-full flex-col items-center justify-center gap-8 px-16 text-center">
          <div className="rd-accent-gradient flex h-20 w-20 items-center justify-center rounded-3xl shadow-[0_20px_60px_-15px_rgba(255,107,44,0.5)]">
            <BookOpen size={36} className="text-[#1a0e05]" />
          </div>
          <div className="flex flex-col gap-3">
            <h2 className="font-display text-3xl font-semibold text-[var(--rd-text)]">
              Read four books.
              <br />
              Win the semester.
            </h2>
            <p className="max-w-[320px] text-[14px] leading-relaxed text-[var(--rd-text-muted)]">
              Teams of 2–3, one book a month, live quiz nights, and bonus tasks — the
              top team on the leaderboard takes the prize.
            </p>
          </div>
          <div className="flex items-center gap-6 text-[12px] text-[var(--rd-text-muted)]">
            <span className="flex items-center gap-2">
              <Flame size={15} className="text-[var(--rd-accent-from)]" />
              Reading streaks
            </span>
            <span className="flex items-center gap-2">
              <Trophy size={15} className="text-[var(--rd-accent-from)]" />
              Team leaderboard
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
