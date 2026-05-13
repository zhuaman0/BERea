import Link from "next/link";
import { ArrowRight, Users, Star, Zap, Timer, BookOpen, Film, Bot, BarChart2, Flame } from "lucide-react";
import { LandingNavLight } from "@/shared/components/layout/LandingNavLight";

// ─── Tools data ───────────────────────────────────────────────────────────────

const TOOLS = [
  {
    icon:      Timer,
    label:     "Pomodoro Timer",
    tagline:   "Focused intervals that defeat fatigue",
    href:      "/study",
    badge:     "Most popular" as const,
    iconBg:    "bg-orange-50",
    iconColor: "text-orange-500",
    accent:    "group-hover:text-orange-500",
  },
  {
    icon:      BookOpen,
    label:     "Flashcards",
    tagline:   "Spaced repetition that actually sticks",
    href:      "/study",
    badge:     null,
    iconBg:    "bg-blue-50",
    iconColor: "text-blue-800",
    accent:    "group-hover:text-blue-800",
  },
  {
    icon:      Film,
    label:     "YouTube Analyzer",
    tagline:   "Turn any lecture into study notes",
    href:      "/materials",
    badge:     "Beta" as const,
    iconBg:    "bg-red-50",
    iconColor: "text-red-500",
    accent:    "group-hover:text-red-500",
  },
  {
    icon:      Bot,
    label:     "AI Study Coach",
    tagline:   "A coaching persona built for your mood",
    href:      "/personas",
    badge:     null,
    iconBg:    "bg-indigo-50",
    iconColor: "text-indigo-500",
    accent:    "group-hover:text-indigo-500",
  },
  {
    icon:      BarChart2,
    label:     "Weekly Analytics",
    tagline:   "See exactly what conditions unlock your focus",
    href:      "/analytics",
    badge:     null,
    iconBg:    "bg-emerald-50",
    iconColor: "text-emerald-500",
    accent:    "group-hover:text-emerald-500",
  },
  {
    icon:      Flame,
    label:     "Streak & Goals",
    tagline:   "Build consistency, not just willpower",
    href:      "/dashboard",
    badge:     null,
    iconBg:    "bg-amber-50",
    iconColor: "text-amber-500",
    accent:    "group-hover:text-amber-500",
  },
] as const;

const HOW_IT_WORKS = [
  {
    step:   "01",
    title:  "Pick a method",
    desc:   "Choose from Pomodoro, flashcards, AI coaching, and more. No commitment — try anything.",
    iconBg: "bg-blue-800",
    icon:   "🎯",
  },
  {
    step:   "02",
    title:  "Study, we observe",
    desc:   "BERea silently tracks your focus score, time of day, method used, and session length.",
    iconBg: "bg-slate-700",
    icon:   "📡",
  },
  {
    step:   "03",
    title:  "Read your results",
    desc:   "Weekly reports show which conditions unlock your best performance — week by week.",
    iconBg: "bg-gradient-to-br from-orange-400 to-rose-500",
    icon:   "📊",
  },
] as const;

// ─── Persona & testimonial data ───────────────────────────────────────────────

const PERSONAS = [
  {
    emoji:    "😊",
    name:     "Kind Coach",
    tagline:  "Gentle, encouraging, patient",
    color:    "text-emerald-400",
    border:   "border-emerald-500/25",
    accent:   "bg-emerald-500/10",
    dot:      "bg-emerald-400",
    message:  "You've studied 45 minutes straight — that's incredible! Take a well-earned 5-min break. You're doing great. 🌟",
    best:     ["Anxiety & burnout", "First-time learners", "Low-confidence days"],
  },
  {
    emoji:    "💪",
    name:     "Tough Coach",
    tagline:  "Direct, accountable, no-excuses",
    color:    "text-blue-400",
    border:   "border-blue-500/25",
    accent:   "bg-blue-500/10",
    dot:      "bg-blue-400",
    message:  "You said 2 hours. It's been 18 minutes and you've checked your phone 3 times. Lock. In. Now.",
    best:     ["Chronic procrastination", "Goal accountability", "When you need a push"],
  },
  {
    emoji:    "🔥",
    name:     "Intense Coach",
    tagline:  "Elite standards, zero compromise",
    color:    "text-indigo-300",
    border:   "border-indigo-400/25",
    accent:   "bg-indigo-500/10",
    dot:      "bg-indigo-300",
    message:  "Top performers don't take unscheduled breaks. Every minute is borrowed from your future self.",
    best:     ["Exam crunch mode", "IELTS / competitive prep", "High-stakes goals"],
  },
] as const;

const TESTIMONIALS = [
  {
    quote:      "I always thought I was bad at studying. BERea showed me I just needed 25-min Pomodoro sessions in the morning. My focus score jumped 40% in two weeks.",
    name:       "Aisha K.",
    role:       "Computer Science, Year 2",
    initials:   "AK",
    avatarBg:   "bg-blue-800",
    metric:     "Focus ↑ 40%",
    metricText: "text-emerald-700",
    metricBg:   "bg-emerald-50",
  },
  {
    quote:      "The Tough Coach persona is exactly what I needed. I procrastinated for months. Now I have a 34-day streak and I've never felt more in control of my time.",
    name:       "Marco T.",
    role:       "Pre-med, 3rd year",
    initials:   "MT",
    avatarBg:   "bg-blue-700",
    metric:     "34-day streak",
    metricText: "text-blue-800",
    metricBg:   "bg-blue-50",
  },
  {
    quote:      "I was targeting IELTS 6.5 and scored 7.5. The analytics revealed that flashcards in the evening were 3× more effective for me than any morning session.",
    name:       "Yuki S.",
    role:       "IELTS preparation",
    initials:   "YS",
    avatarBg:   "bg-indigo-700",
    metric:     "IELTS 7.5",
    metricText: "text-indigo-700",
    metricBg:   "bg-indigo-50",
  },
] as const;

// ─── Social icons (inline SVG — lucide v1 dropped brand icons) ────────────────

function IconGithub() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function IconX() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function IconLinkedin() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

// ─── Hero chart constants ─────────────────────────────────────────────────────

const CHART_POINTS: [number, number][] = [
  [0, 82], [50, 72], [100, 76], [150, 54], [200, 44], [250, 22], [280, 10],
];

const LINE_PATH =
  "M0,82 C20,79 35,74 50,72 C65,70 80,77 100,76 C125,74 135,60 150,54 C165,48 180,46 200,44 C220,41 235,28 250,22 C260,18 272,13 280,10";

const AREA_PATH = `${LINE_PATH} L280,108 L0,108 Z`;

const METHODS = [
  { icon: "🍅", label: "Pomodoro",   sub: "94 min today", bg: "bg-orange-50", border: "border-orange-100", color: "text-orange-700" },
  { icon: "📚", label: "Flashcards", sub: "47 cards",      bg: "bg-blue-50",   border: "border-blue-100",   color: "text-blue-800"   },
  { icon: "🤖", label: "AI Coach",   sub: "3 sessions",    bg: "bg-indigo-50", border: "border-indigo-100", color: "text-indigo-700" },
] as const;

// ─── Hero Visual (right column) ───────────────────────────────────────────────

function HeroVisual() {
  return (
    <div className="relative w-full max-w-[400px] mx-auto py-14 px-5">

      {/* Main analytics card */}
      <div className="bg-white rounded-3xl shadow-2xl shadow-blue-100/60 p-6 animate-float">

        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Focus Journey</p>
            <p className="text-sm font-bold text-slate-900 mt-0.5">This week vs last week</p>
          </div>
          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
            ↑ 23%
          </span>
        </div>

        {/* Area + line chart — line draws in on load */}
        <div className="mb-4">
          <svg viewBox="0 0 280 108" className="w-full overflow-visible" aria-hidden="true">
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#1e40af" stopOpacity="0.14" />
                <stop offset="100%" stopColor="#1e40af" stopOpacity="0.01" />
              </linearGradient>
            </defs>
            <path d={AREA_PATH} fill="url(#areaGrad)" />
            <path
              d={LINE_PATH}
              fill="none"
              stroke="#1e40af"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength="1"
              strokeDasharray="1"
              strokeDashoffset="1"
              className="animate-[line-draw_1.9s_ease-out_0.4s_forwards]"
            />
            {CHART_POINTS.map(([x, y], i) => (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="3.5"
                fill="white"
                stroke="#1e40af"
                strokeWidth="2"
                style={{ animation: `dot-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) ${1.1 + i * 0.13}s both` }}
              />
            ))}
          </svg>
          <div className="flex justify-between text-[9px] text-slate-300 font-semibold px-0.5 mt-1">
            {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
        </div>

        {/* Study method pills */}
        <div className="flex gap-2">
          {METHODS.map(({ icon, label, sub, bg, border, color }) => (
            <div key={label} className={`flex-1 flex items-center gap-1.5 px-2 py-2 rounded-xl border ${bg} ${border}`}>
              <span className="text-base shrink-0">{icon}</span>
              <div className="min-w-0">
                <p className={`text-[10px] font-bold leading-none truncate ${color}`}>{label}</p>
                <p className="text-[9px] text-slate-400 mt-0.5">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating streak badge — top-right */}
      <div
        className="absolute top-5 -right-1 sm:-right-5 bg-white rounded-2xl shadow-xl shadow-slate-200/80 px-3.5 py-2.5 flex items-center gap-2"
        style={{ animation: "float 3.6s ease-in-out 0.5s infinite" }}
      >
        <span className="text-xl">🔥</span>
        <div>
          <p className="text-sm font-black text-slate-900 leading-none">12 days</p>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">streak</p>
        </div>
      </div>

      {/* Floating focus score badge — bottom-left */}
      <div
        className="absolute bottom-5 -left-1 sm:-left-5 bg-white rounded-2xl shadow-xl shadow-slate-200/80 px-3.5 py-2.5 flex items-center gap-2.5"
        style={{ animation: "float 4.1s ease-in-out 1s infinite" }}
      >
        <div className="w-9 h-9 rounded-xl bg-blue-800 flex items-center justify-center shrink-0 animate-[score-pulse_2.8s_ease-in-out_1.5s_infinite]">
          <span className="text-sm font-black text-white">87</span>
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900 leading-none">Focus score</p>
          <p className="text-[10px] text-slate-400 mt-0.5">personal best ⭐</p>
        </div>
      </div>
    </div>
  );
}

// ─── Section 1: AI Coaching Personas (dark) ───────────────────────────────────

function PersonasSection() {
  return (
    <section className="bg-[#080f1e] py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-1.5 bg-white/5 text-slate-400 text-xs font-semibold px-4 py-1.5 rounded-full border border-white/10 mb-5 select-none">
            🤖 AI Coaching Personas
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Choose how you want to be coached
          </h2>
          <p className="text-slate-400 max-w-md mx-auto leading-relaxed">
            Three distinct AI personalities. Each adapts to your mood. Switch anytime — no judgment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PERSONAS.map(({ emoji, name, tagline, color, border, accent, dot, message, best }) => (
            <div
              key={name}
              className={`flex flex-col p-7 rounded-3xl border bg-white/[0.03] ${border} hover:bg-white/[0.055] transition-colors duration-200`}
            >
              {/* Avatar */}
              <div className={`w-12 h-12 rounded-2xl ${accent} flex items-center justify-center text-2xl mb-5 shrink-0`}>
                {emoji}
              </div>

              {/* Name */}
              <h3 className={`text-lg font-bold mb-1 ${color}`}>{name}</h3>
              <p className="text-slate-500 text-sm mb-5">{tagline}</p>

              {/* Example message */}
              <div className={`rounded-2xl p-4 ${accent} border ${border} mb-5 flex-1`}>
                <p className="text-slate-300 text-sm leading-relaxed italic">"{message}"</p>
              </div>

              {/* Best for */}
              <div>
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3">Best for</p>
                <ul className="flex flex-col gap-2">
                  {best.map((b) => (
                    <li key={b} className="flex items-center gap-2 text-xs text-slate-400">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section 2: Student Testimonials (light) ──────────────────────────────────

function TestimonialsSection() {
  return (
    <section className="bg-white py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-800 text-xs font-semibold px-4 py-1.5 rounded-full border border-blue-100 mb-5 select-none">
            ⭐ Student Stories
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Real students. Real results.
          </h2>
          <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
            BERea doesn't guess what works for you — it measures it.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(({ quote, name, role, initials, avatarBg, metric, metricText, metricBg }) => (
            <div
              key={name}
              className="flex flex-col p-7 rounded-3xl bg-white border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-200"
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#1e40af" aria-hidden="true">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <p className="text-slate-600 text-sm leading-relaxed flex-1 mb-5">
                &ldquo;{quote}&rdquo;
              </p>

              {/* Metric chip */}
              <span className={`self-start text-xs font-bold px-3 py-1.5 rounded-full mb-5 ${metricBg} ${metricText}`}>
                {metric}
              </span>

              {/* Author */}
              <div className="flex items-center gap-3 pt-5 border-t border-slate-100">
                <div className={`w-10 h-10 rounded-xl ${avatarBg} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                  {initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 leading-none">{name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

const FOOTER_PRODUCT = ["Features", "Pomodoro Timer", "Flashcards", "AI Study Coach", "Analytics"];
const FOOTER_LINKS   = ["About", "Blog", "Changelog", "Support", "Status"];
const FOOTER_PRICING = ["Free Plan", "Pro Plan", "For Teams", "Compare Plans", "Student Discount"];

function PremiumFooter() {
  return (
    <footer className="bg-[#0B1121]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">

          {/* Brand */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                B
              </div>
              <span className="text-white font-bold text-lg tracking-tight">BERea</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-[220px]">
              Built with love for students who deserve to understand how they learn.
            </p>
            <div className="flex gap-3">
              {[
                { label: "GitHub",   Icon: IconGithub },
                { label: "X",        Icon: IconX },
                { label: "LinkedIn", Icon: IconLinkedin },
              ].map(({ label, Icon }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="w-9 h-9 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-colors duration-150"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-white text-[11px] font-bold tracking-[0.18em] uppercase mb-6">Product</h3>
            <ul className="flex flex-col gap-4">
              {FOOTER_PRODUCT.map((item) => (
                <li key={item}>
                  <a href="#" className="text-slate-400 hover:text-white text-sm transition-colors duration-150">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white text-[11px] font-bold tracking-[0.18em] uppercase mb-6">Links</h3>
            <ul className="flex flex-col gap-4">
              {FOOTER_LINKS.map((item) => (
                <li key={item}>
                  <a href="#" className="text-slate-400 hover:text-white text-sm transition-colors duration-150">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Pricing */}
          <div>
            <h3 className="text-white text-[11px] font-bold tracking-[0.18em] uppercase mb-6">Pricing</h3>
            <ul className="flex flex-col gap-4">
              {FOOTER_PRICING.map((item) => (
                <li key={item}>
                  <a href="#" className="text-slate-400 hover:text-white text-sm transition-colors duration-150">{item}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-slate-500 text-sm">© 2026 BERea. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="bg-white text-slate-900 min-h-screen">
      <LandingNavLight />

      <main>

        {/* ══ Hero — text LEFT, visual RIGHT ════════════════════════════════════ */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* LEFT: headline + CTAs */}
            <div className="flex flex-col items-start gap-6 animate-fade-in-up">

              <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-800 text-xs font-semibold px-4 py-1.5 rounded-full border border-blue-100 select-none">
                ✦ Study intelligence for overwhelmed students
              </span>

              <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 tracking-tight leading-[1.08]">
                Find the study method
                <br />
                <span className="text-blue-800">your brain loves.</span>
              </h1>

              <p className="text-lg text-slate-500 max-w-md leading-relaxed">
                Most students waste months on techniques that don&apos;t fit them.
                BERea runs the experiments so you don&apos;t have to.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 bg-blue-800 text-white font-semibold px-7 py-3.5 rounded-2xl hover:bg-blue-900 transition-colors shadow-lg shadow-blue-200 text-base"
                >
                  Get started free <ArrowRight size={16} />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 bg-white text-slate-700 font-medium px-6 py-3.5 rounded-2xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors text-base shadow-sm"
                >
                  How it works
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-5 text-sm text-slate-400">
                <span className="flex items-center gap-1.5"><Users size={14} /> 1,200+ students</span>
                <span className="text-slate-200 select-none" aria-hidden>|</span>
                <span className="flex items-center gap-1.5"><Star size={14} /> 4.8 / 5 rating</span>
                <span className="text-slate-200 select-none" aria-hidden>|</span>
                <span className="flex items-center gap-1.5"><Zap size={14} /> Free forever</span>
              </div>
            </div>

            {/* RIGHT: animated dashboard visual */}
            <div className="flex justify-center lg:justify-end">
              <HeroVisual />
            </div>
          </div>
        </section>

        {/* ══ Tool Cards ════════════════════════════════════════════════════════ */}
        <section id="tools" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-28">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
              Every tool you need. Nothing you don&apos;t.
            </h2>
            <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
              Six proven study methods, one clean interface.
              Try them all — your data reveals which one wins.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {TOOLS.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.label}
                  href={tool.href}
                  className="group flex flex-col p-6 rounded-3xl border border-slate-100 bg-white shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-200/70 hover:-translate-y-1 transition-all duration-200"
                >
                  <div className={`w-12 h-12 ${tool.iconBg} rounded-2xl flex items-center justify-center mb-5 shrink-0`}>
                    <Icon size={22} className={tool.iconColor} />
                  </div>
                  <div className="flex items-start gap-2 flex-wrap mb-1.5">
                    <span className="font-semibold text-slate-900 text-[15px] leading-snug">{tool.label}</span>
                    {tool.badge && (
                      <span className="text-[10px] font-semibold bg-blue-50 text-blue-800 px-2 py-0.5 rounded-full shrink-0 mt-px border border-blue-100">
                        {tool.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">{tool.tagline}</p>
                  <span className={`mt-5 inline-flex items-center gap-1 text-xs font-semibold text-slate-300 ${tool.accent} transition-colors duration-150`}>
                    Try it <ArrowRight size={11} />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ══ NEW: AI Coaching Personas (dark) ══════════════════════════════════ */}
        <PersonasSection />

        {/* ══ How it works ══════════════════════════════════════════════════════ */}
        <section id="how-it-works" className="bg-slate-50 border-y border-slate-100 py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              From signup to insight in minutes
            </h2>
            <p className="text-slate-500 max-w-sm mx-auto mb-20 leading-relaxed">
              No onboarding quiz. No filler screens. Just start studying — the data does the rest.
            </p>

            <div className="relative grid md:grid-cols-3 gap-10">
              <div
                className="hidden md:block absolute top-[3.25rem] left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px bg-slate-200"
                aria-hidden="true"
              />
              {HOW_IT_WORKS.map(({ step, title, desc, iconBg, icon }) => (
                <div key={step} className="flex flex-col items-center gap-4 relative">
                  <span className="absolute -top-3 text-8xl font-black text-slate-100 leading-none select-none pointer-events-none">
                    {step}
                  </span>
                  <div className={`relative z-10 w-14 h-14 ${iconBg} rounded-2xl flex items-center justify-center text-2xl shadow-md`}>
                    {icon}
                  </div>
                  <h3 className="font-semibold text-slate-900 text-lg">{title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ NEW: Student Testimonials (light) ═════════════════════════════════ */}
        <TestimonialsSection />

        {/* ══ Bottom CTA banner ═════════════════════════════════════════════════ */}
        <section className="bg-blue-800 py-20 px-4 sm:px-6 text-center">
          <div className="max-w-2xl mx-auto flex flex-col items-center gap-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Ready to stop guessing?
            </h2>
            <p className="text-blue-200 leading-relaxed max-w-md">
              Join 1,200+ students who finally know exactly how — and when — they learn best.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-white text-blue-800 font-semibold px-8 py-4 rounded-2xl hover:bg-blue-50 transition-colors text-base shadow-lg shadow-blue-950/20"
            >
              Start for free — no credit card <ArrowRight size={16} />
            </Link>
          </div>
        </section>

      </main>

      <PremiumFooter />
    </div>
  );
}
