"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Moon, Sun } from "lucide-react";

const NAV_LINKS = [
  { label: "How it works",  href: "#how-it-works" },
  { label: "Study methods", href: "#tools"        },
  { label: "About",         href: "#about"        },
] as const;

const LANGS = ["EN", "KK", "RU"] as const;
type Lang = (typeof LANGS)[number];

export function LandingNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  // Dark is default — track when user has opted into LIGHT
  const [isLight, setIsLight]   = useState(false);
  const [lang, setLang]         = useState<Lang>("EN");

  useEffect(() => {
    setIsLight(document.documentElement.classList.contains("light"));
  }, []);

  function toggleTheme() {
    const next = !isLight;
    setIsLight(next);
    document.documentElement.classList.toggle("light", next);
    localStorage.setItem("berea-theme", next ? "light" : "dark");
  }

  return (
    <header className="sticky top-0 z-50 bg-[#0b1121]/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-6">
        <nav className="h-16 flex items-center justify-between gap-8">

          {/* ── Logo ─────────────────────────────────────── */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-sm select-none">
              B
            </div>
            <span className="font-bold text-white text-lg tracking-tight">BERea</span>
          </Link>

          {/* ── Desktop centre links ─────────────────────── */}
          <div className="hidden md:flex items-center gap-8 flex-1">
            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                {label}
              </a>
            ))}
          </div>

          {/* ── Desktop right controls ───────────────────── */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            {/* Language pill */}
            <div className="flex items-center bg-slate-800/60 rounded-lg p-0.5">
              {LANGS.map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`text-xs font-medium px-2.5 py-1.5 rounded-md transition-colors ${
                    lang === l
                      ? "bg-slate-700 text-white"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            {/* Light / dark toggle */}
            <button
              onClick={toggleTheme}
              aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              {isLight ? <Moon size={17} /> : <Sun size={17} />}
            </button>

            <div className="w-px h-5 bg-slate-700 mx-1" aria-hidden />

            <Link
              href="/login"
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors px-2 py-2"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-500 transition-colors"
            >
              Get started
            </Link>
          </div>

          {/* ── Mobile hamburger ─────────────────────────── */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-800 transition-colors"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>
      </div>

      {/* ── Mobile panel ─────────────────────────────────── */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-[#0b1121] px-6 py-5 flex flex-col gap-5">
          <div className="flex flex-col gap-4">
            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </a>
            ))}
          </div>

          <div className="flex flex-col gap-2.5 pt-4 border-t border-slate-800">
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="text-sm font-semibold text-center py-3 rounded-2xl border border-slate-700 text-white hover:bg-slate-800 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              onClick={() => setMenuOpen(false)}
              className="text-sm font-semibold text-center py-3 rounded-2xl bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
            >
              Get started free
            </Link>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <div className="flex items-center bg-slate-800/60 rounded-lg p-0.5">
              {LANGS.map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
                    lang === l ? "bg-slate-700 text-white" : "text-slate-500"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
              {isLight ? <Moon size={15} /> : <Sun size={15} />}
              <span>{isLight ? "Dark mode" : "Light mode"}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
