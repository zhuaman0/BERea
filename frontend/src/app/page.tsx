import Image from "next/image";
import Link from "next/link";
import { Space_Grotesk, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import {
  BookOpen, Brain, Gamepad2, Swords, Trophy, Users,
  ArrowRight, ChevronDown, Flame,
} from "lucide-react";
import "@/app/reading/reading.css";
import { TeamRegistrationForm } from "@/features/reading/components/TeamRegistrationForm";
import { SEASON_RULES } from "@/features/reading/lib/seasonRules";

const spaceGrotesk = Space_Grotesk({ variable: "--font-space-grotesk", subsets: ["latin"], display: "swap" });
const ibmPlexSans  = IBM_Plex_Sans({ variable: "--font-ibm-plex-sans", subsets: ["latin"], weight: ["400", "500", "600"], display: "swap" });
const ibmPlexMono  = IBM_Plex_Mono({ variable: "--font-ibm-plex-mono", subsets: ["latin"], weight: ["400", "500"], display: "swap" });

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#rules",    label: "Rules" },
  { href: "#register", label: "Register" },
];

const FEATURES = [
  { icon: Swords,    title: "Team Challenges",        desc: "Compete with your team in thrilling book trivia." },
  { icon: BookOpen,  title: "Monthly Assignments",     desc: "Read a new book every month to prepare for the game." },
  { icon: Gamepad2,  title: "Interactive Gameplay",    desc: "Engage in exciting rounds of questions and answers." },
  { icon: Trophy,    title: "Season Finale",           desc: "Culminate the semester with an epic battle of knowledge." },
  { icon: Users,     title: "Team Collaboration",      desc: "Work together with your teammates to conquer the challenges." },
  { icon: Brain,     title: "Intellectual Competition", desc: "Test your literary knowledge and strategic thinking." },
] as const;

const FLAME_PATH =
  "M0,200 L0,65 L43,134 L86,70 L129,166 L171,48 L214,129 L257,79 L300,131 L343,68 L386,162 L429,48 L471,157 L514,58 L557,127 L600,50 L643,152 L686,71 L729,129 L771,60 L814,130 L857,80 L900,152 L943,48 L986,161 L1029,52 L1071,139 L1114,85 L1157,165 L1200,82 L1200,200 Z";

const EMBERS = [
  { left: "8%",  size: 4, delay: "0s",   duration: "5.5s", drift: "10px" },
  { left: "18%", size: 3, delay: "1.1s", duration: "6.5s", drift: "-14px" },
  { left: "30%", size: 5, delay: "2.3s", duration: "5s",   drift: "8px" },
  { left: "46%", size: 3, delay: "0.6s", duration: "7s",   drift: "-10px" },
  { left: "58%", size: 4, delay: "3s",   duration: "5.8s", drift: "14px" },
  { left: "70%", size: 3, delay: "1.8s", duration: "6.2s", drift: "-8px" },
  { left: "82%", size: 5, delay: "0.3s", duration: "5.2s", drift: "12px" },
  { left: "92%", size: 3, delay: "2.6s", duration: "6.8s", drift: "-12px" },
] as const;

export default function LandingPage() {
  return (
    <div className={`reading-theme ${spaceGrotesk.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable}`}>
      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <header className="fixed inset-x-0 top-0 z-20 border-b border-white/5 bg-[var(--rd-ink)]/75 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6 lg:px-10">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo_451.png" alt="451" width={36} height={36} className="rounded-lg" />
            <span className="font-display text-lg font-semibold tracking-wide text-[var(--rd-text)]">451°</span>
          </Link>

          <nav className="font-display hidden items-center gap-1 sm:flex">
            <span className="rd-accent-gradient rounded-full px-4 py-2 text-sm font-semibold text-[#1a0e05]">
              Main
            </span>
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-full px-4 py-2 text-sm font-medium text-[var(--rd-text-muted)] transition-colors hover:bg-white/5 hover:text-[var(--rd-text)]"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <Link
            href="/reading/login"
            className="font-display rounded-lg border border-white/15 px-5 py-2 text-sm font-medium text-[var(--rd-text)] transition-colors hover:border-white/30 hover:bg-white/5"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* ── Hero — the one full-viewport block ──────────────────────────────── */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center lg:px-10">
        <div className="absolute inset-0" aria-hidden="true">
          <div className="rd-flame-layer rd-flame-back">
            <svg viewBox="0 0 1200 200" preserveAspectRatio="none" className="h-full w-full">
              <path d={FLAME_PATH} fill="var(--rd-accent-from)" />
            </svg>
          </div>
          <div className="rd-flame-layer rd-flame-mid">
            <svg viewBox="0 0 1200 200" preserveAspectRatio="none" className="h-full w-full">
              <defs>
                <linearGradient id="rd-flame-mid-grad" x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0%" stopColor="var(--rd-accent-from)" />
                  <stop offset="100%" stopColor="var(--rd-accent-to)" />
                </linearGradient>
              </defs>
              <path d={FLAME_PATH} fill="url(#rd-flame-mid-grad)" />
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
        </div>
        {/* Dark scrim behind the headline only — fades out toward the bottom so the flame stays vivid */}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[var(--rd-ink)]/90 via-[var(--rd-ink)]/60 to-transparent"
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center">
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[var(--rd-text-muted)]">
            <Flame size={13} className="text-[var(--rd-accent-from)]" />
            NATS Spirea presents
          </span>
          <h1 className="font-display mt-5 max-w-4xl text-5xl font-semibold leading-[1.05] text-[var(--rd-text)] sm:text-6xl lg:text-7xl">
            451° is a{" "}
            <span className="bg-gradient-to-r from-[var(--rd-accent-from)] to-[var(--rd-accent-to)] bg-clip-text text-transparent">
              book battle
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-[var(--rd-text-muted)]">
            Immerse yourself in the world of literature — team up, read, and compete for
            the semester crown.
          </p>
          <div className="mt-9 flex justify-center">
            <Link
              href="/reading/register"
              className="rd-accent-gradient inline-flex items-center gap-2 rounded-lg px-7 py-3.5 text-sm font-semibold text-[#1a0e05] transition-opacity hover:opacity-90"
            >
              Join the Book Battle
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        <a
          href="#features"
          className="absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-[var(--rd-text-muted)] transition-colors hover:text-[var(--rd-text)]"
        >
          <span className="text-[10px] uppercase tracking-[0.25em]">Scroll</span>
          <ChevronDown size={18} className="animate-bounce" />
        </a>
      </section>

      {/* ── Features — horizontal scroll-snap card rail ─────────────────────── */}
      <section id="features" className="border-t border-white/5 px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <span className="block text-xs uppercase tracking-[0.3em] text-[var(--rd-text-muted)]">Why play</span>
          <h2 className="font-display mt-3 text-3xl font-semibold text-[var(--rd-text)] sm:text-4xl">
            Everything the season needs
          </h2>

          <div className="rd-scroll-x mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-6">
            {FEATURES.map(({ icon: Icon, title, desc }, i) => {
              const tilt = i % 2 === 0 ? "-rotate-1" : "rotate-1";
              return (
                <div
                  key={title}
                  className={`group relative w-[280px] shrink-0 snap-start overflow-hidden rounded-[28px] border border-[var(--rd-border)] bg-[var(--rd-panel)] p-7 transition-all duration-300 ease-out hover:-translate-y-2 hover:rotate-0 hover:scale-[1.03] hover:border-[var(--rd-accent-from)]/50 ${tilt}`}
                >
                  <span
                    className="font-display pointer-events-none absolute -right-3 -top-7 select-none text-7xl font-bold text-white/[0.05]"
                    aria-hidden="true"
                  >
                    0{i + 1}
                  </span>

                  <span className="relative flex h-12 w-12 items-center justify-center rounded-full border border-[var(--rd-accent-from)]/30 bg-[var(--rd-ink)] text-[var(--rd-accent-from)] transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110">
                    <Icon size={22} />
                  </span>

                  <h3 className="font-display relative mt-5 text-lg font-semibold text-[var(--rd-text)]">
                    {title}
                  </h3>
                  <p className="relative mt-2 text-sm leading-relaxed text-[var(--rd-text-muted)]">
                    {desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Rules ────────────────────────────────────────────────────────── */}
      <section id="rules" className="border-t border-white/5 px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <span className="block text-center text-xs uppercase tracking-[0.3em] text-[var(--rd-text-muted)]">
            How it works
          </span>
          <h2 className="font-display mt-3 text-center text-3xl font-semibold text-[var(--rd-text)] sm:text-4xl">
            Game rules
          </h2>

          {/* a single lit fuse running down the page — each rule ignites as it burns past */}
          <div className="relative mx-auto mt-16 max-w-2xl">
            <span
              className="rd-fuse-spark pointer-events-none absolute left-5 h-2.5 w-2.5 -translate-x-1/2 rounded-full"
              aria-hidden="true"
            />

            {SEASON_RULES.map((rule, i) => {
              const isFirst = i === 0;
              const isLast = i === SEASON_RULES.length - 1;
              return (
                <div key={rule.title} className="relative flex gap-6">
                  <div className="relative w-10 flex-none">
                    {!isFirst && (
                      <span
                        className="absolute left-1/2 top-0 bottom-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-transparent to-[var(--rd-accent-from)]/50"
                        aria-hidden="true"
                      />
                    )}
                    {!isLast && (
                      <span
                        className="absolute left-1/2 top-1/2 bottom-0 w-px -translate-x-1/2 bg-gradient-to-b from-[var(--rd-accent-from)]/50 to-transparent"
                        aria-hidden="true"
                      />
                    )}
                    <span
                      className="rd-node-dot absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--rd-accent-from)]"
                      style={{ animationDelay: `${i * 0.3}s` }}
                      aria-hidden="true"
                    />
                  </div>

                  <div className={`relative min-w-0 flex-1 ${isLast ? "pb-0" : "pb-10"}`}>
                    <span
                      className="font-display pointer-events-none absolute -top-5 right-2 select-none text-7xl font-bold leading-none text-white/[0.05]"
                      aria-hidden="true"
                    >
                      0{i + 1}
                    </span>
                    <div className="relative rounded-2xl border border-[var(--rd-border)] bg-[var(--rd-panel)] p-6 text-left transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[var(--rd-accent-from)]/50">
                      <span className="font-display text-xs font-bold uppercase tracking-[0.2em] text-[var(--rd-accent-from)]">
                        Rule 0{i + 1}
                      </span>
                      <p className="font-display mt-2 text-lg font-semibold text-[var(--rd-text)]">{rule.title}</p>
                      <p className="mt-1.5 text-[14px] leading-relaxed text-[var(--rd-text-muted)]">{rule.body}</p>
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
            <p className="relative mt-3 text-sm text-[var(--rd-text-muted)]">
              Six rules. One fuse. Light it.
            </p>
          </div>
        </div>
      </section>

      {/* ── Register ─────────────────────────────────────────────────────── */}
      <section id="register" className="border-t border-white/5 px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-2xl">
          <span className="block text-center text-xs uppercase tracking-[0.3em] text-[var(--rd-text-muted)]">
            Join the battle
          </span>
          <h2 className="font-display mt-3 text-center text-3xl font-semibold text-[var(--rd-text)] sm:text-4xl">
            Register your team
          </h2>
          <p className="mx-auto mt-4 max-w-md text-center text-sm text-[var(--rd-text-muted)]">
            Enter your team name and all 3 players, then attach the PDF receipt for your
            bank transfer. We&apos;ll confirm your spot by email.
          </p>

          <div className="mt-10">
            <TeamRegistrationForm />
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 px-6 py-10 lg:px-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-xs text-[var(--rd-text-muted)] sm:flex-row">
          <span>© 2026 451° · NATS Spirea</span>
          <div className="flex flex-wrap justify-center gap-6">
            <span className="cursor-default hover:text-[var(--rd-text)]">Privacy Policy</span>
            <span className="cursor-default hover:text-[var(--rd-text)]">Contact us</span>
            <span className="cursor-default hover:text-[var(--rd-text)]">Support us</span>
            <span className="cursor-default hover:text-[var(--rd-text)]">About us</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
