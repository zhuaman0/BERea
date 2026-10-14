import Image from "next/image";
import Link from "next/link";
import { Space_Grotesk, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { ArrowRight, ChevronDown, Flame } from "lucide-react";
import "@/app/reading/reading.css";
import { LandingRulesSection } from "@/features/reading/components/LandingRulesSection";

const spaceGrotesk = Space_Grotesk({ variable: "--font-space-grotesk", subsets: ["latin"], display: "swap" });
const ibmPlexSans  = IBM_Plex_Sans({ variable: "--font-ibm-plex-sans", subsets: ["latin"], weight: ["400", "500", "600"], display: "swap" });
const ibmPlexMono  = IBM_Plex_Mono({ variable: "--font-ibm-plex-mono", subsets: ["latin"], weight: ["400", "500"], display: "swap" });

const NAV_LINKS = [
  { href: "#rules", label: "Rules" },
];

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
          href="#rules"
          className="absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-[var(--rd-text-muted)] transition-colors hover:text-[var(--rd-text)]"
        >
          <span className="text-[10px] uppercase tracking-[0.25em]">Scroll</span>
          <ChevronDown size={18} className="animate-bounce" />
        </a>
      </section>

      <LandingRulesSection />

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
