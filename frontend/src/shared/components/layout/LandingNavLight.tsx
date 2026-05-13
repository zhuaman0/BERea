"use client";

import { useState } from "react";
import Link from "next/link";
import { Globe, Moon, Sun, Menu, X, ChevronDown } from "lucide-react";

const NAV_LINKS = [
  { label: "How it works",  href: "#how-it-works" },
  { label: "Study methods", href: "#tools"        },
  { label: "About",         href: "#about"        },
] as const;

const LANGS = ["EN", "KK", "RU"] as const;
type Lang = (typeof LANGS)[number];

export function LandingNavLight() {
  const [menuOpen, setMenuOpen]   = useState(false);
  const [langOpen, setLangOpen]   = useState(false);
  const [isDark, setIsDark]       = useState(false);
  const [lang, setLang]           = useState<Lang>("EN");

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("light", !next);
  }

  function pickLang(l: Lang) {
    setLang(l);
    setLangOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-sm shadow-slate-100/60">
      <div className="max-w-7xl mx-auto px-6">
        <nav className="h-16 flex items-center justify-between gap-8">

          {/* ── Logo ──────────────────────────────────────── */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-blue-800 flex items-center justify-center text-white font-bold text-sm select-none">
              B
            </div>
            <span className="font-bold text-slate-900 text-lg tracking-tight">BERea</span>
          </Link>

          {/* ── Desktop centre links ───────────────────────── */}
          <div className="hidden md:flex items-center gap-8 flex-1">
            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
              >
                {label}
              </a>
            ))}
          </div>

          {/* ── Desktop right controls ─────────────────────── */}
          <div className="hidden md:flex items-center gap-1.5 shrink-0">

            {/* Language selector */}
            <div className="relative">
              <button
                onClick={() => setLangOpen((o) => !o)}
                className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 px-2.5 py-2 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <Globe size={15} />
                {lang}
                <ChevronDown size={13} className={`transition-transform duration-150 ${langOpen ? "rotate-180" : ""}`} />
              </button>

              {langOpen && (
                <div className="absolute right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg shadow-slate-200/60 py-1 min-w-[80px] z-50">
                  {LANGS.map((l) => (
                    <button
                      key={l}
                      onClick={() => pickLang(l)}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                        lang === l
                          ? "text-blue-800 font-semibold bg-blue-50"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            <div className="w-px h-5 bg-slate-200 mx-1" aria-hidden />

            <Link
              href="/login"
              className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors px-3 py-2"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold bg-blue-800 text-white px-4 py-2 rounded-xl hover:bg-blue-900 transition-colors"
            >
              Get started
            </Link>
          </div>

          {/* ── Mobile hamburger ─────────────────────────── */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>
      </div>

      {/* ── Mobile panel ────────────────────────────────── */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-6 py-5 flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors py-2"
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </a>
            ))}
          </div>

          <div className="flex flex-col gap-2.5 pt-4 border-t border-slate-100">
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="text-sm font-semibold text-center py-3 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              onClick={() => setMenuOpen(false)}
              className="text-sm font-semibold text-center py-3 rounded-2xl bg-blue-800 text-white hover:bg-blue-900 transition-colors"
            >
              Get started free
            </Link>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
              {LANGS.map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
                    lang === l ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors"
            >
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
              <span>{isDark ? "Light mode" : "Dark mode"}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
