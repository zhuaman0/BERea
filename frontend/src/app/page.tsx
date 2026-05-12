import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BERea — Discover how YOU learn best",
};

export default function LandingPage() {
  return (
    <main className="flex flex-col min-h-screen">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-surface/80 backdrop-blur-sm sticky top-0 z-10">
        <span className="text-xl font-bold text-brand-600 tracking-tight">BERea</span>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="text-sm font-medium bg-brand-500 text-white px-4 py-2 rounded-xl hover:bg-brand-600 transition-colors"
          >
            Get started free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center flex-1 text-center px-6 py-24 gap-6">
        <span className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full">
          ✦ Personalized study intelligence
        </span>
        <h1 className="text-5xl md:text-7xl font-bold text-text-primary tracking-tight max-w-3xl leading-tight">
          Discover how{" "}
          <span className="text-brand-500">YOU</span>{" "}
          learn best
        </h1>
        <p className="text-xl text-text-secondary max-w-xl leading-relaxed">
          Stop guessing. Start testing. BERea helps you find the study methods
          that actually work for your brain — before burnout finds you.
        </p>
        <div className="flex items-center gap-4">
          <Link
            href="/register"
            className="text-base font-semibold bg-brand-500 text-white px-8 py-3.5 rounded-xl hover:bg-brand-600 transition-colors shadow-sm"
          >
            Start for free →
          </Link>
          <Link
            href="/login"
            className="text-base font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            Sign in
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="grid md:grid-cols-3 gap-6 px-6 pb-24 max-w-5xl mx-auto w-full">
        {[
          {
            icon: "⏱️",
            title: "Test every method",
            desc: "Pomodoro, flashcards, spaced repetition — try them all and let data show what works.",
          },
          {
            icon: "🤖",
            title: "AI coaching personas",
            desc: "Choose a coach that matches your mood — gentle encouragement or intense accountability.",
          },
          {
            icon: "📊",
            title: "Weekly insights",
            desc: "See which conditions help you focus most. Music or silence? Morning or night?",
          },
        ].map(({ icon, title, desc }) => (
          <div
            key={title}
            className="flex flex-col gap-3 p-6 rounded-card bg-surface-alt border border-gray-100"
          >
            <span className="text-3xl">{icon}</span>
            <h3 className="font-semibold text-text-primary">{title}</h3>
            <p className="text-sm text-text-secondary leading-relaxed">{desc}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
