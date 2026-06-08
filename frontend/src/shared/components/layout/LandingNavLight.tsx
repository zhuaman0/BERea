"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Globe, Moon, Sun, Menu, X, ChevronDown } from "lucide-react";
import { setLocale } from "@/i18n/actions";

const LOCALES = [
  { code: "en", label: "EN" },
  { code: "kk", label: "KK" },
  { code: "ru", label: "RU" },
] as const;

export function LandingNavLight() {
  const t      = useTranslations("landing");
  const locale = useLocale();
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [isDark,   setIsDark]   = useState(false);
  const [isPending, startTransition] = useTransition();

  const NAV_LINKS = [
    { label: t("howItWorks"),   href: "#how-it-works" },
    { label: t("studyMethods"), href: "#tools"        },
    { label: t("about"),        href: "#about"        },
  ];

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("light", !next);
  }

  function pickLang(code: string) {
    setLangOpen(false);
    startTransition(async () => {
      await setLocale(code);
      router.refresh();
    });
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
                key={href}
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
                disabled={isPending}
                className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 px-2.5 py-2 rounded-xl hover:bg-slate-100 transition-colors disabled:opacity-50"
              >
                <Globe size={15} />
                {locale.toUpperCase()}
                <ChevronDown size={13} className={`transition-transform duration-150 ${langOpen ? "rotate-180" : ""}`} />
              </button>

              {langOpen && (
                <div className="absolute right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg shadow-slate-200/60 py-1 min-w-[80px] z-50">
                  {LOCALES.map(({ code, label }) => (
                    <button
                      key={code}
                      onClick={() => pickLang(code)}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                        locale === code
                          ? "text-blue-800 font-semibold bg-blue-50"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              aria-label={isDark ? t("lightMode") : t("darkMode")}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            <div className="w-px h-5 bg-slate-200 mx-1" aria-hidden />

            <Link
              href="/login"
              className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors px-3 py-2"
            >
              {t("signIn")}
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold bg-blue-800 text-white px-4 py-2 rounded-xl hover:bg-blue-900 transition-colors"
            >
              {t("getStarted")}
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
                key={href}
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
              {t("signIn")}
            </Link>
            <Link
              href="/register"
              onClick={() => setMenuOpen(false)}
              className="text-sm font-semibold text-center py-3 rounded-2xl bg-blue-800 text-white hover:bg-blue-900 transition-colors"
            >
              {t("getStartedFree")}
            </Link>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div className="flex items-center gap-0.5 bg-slate-100 rounded-lg p-0.5">
              {LOCALES.map(({ code, label }) => (
                <button
                  key={code}
                  onClick={() => pickLang(code)}
                  disabled={isPending}
                  className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors disabled:opacity-50 ${
                    locale === code ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors"
            >
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
              <span>{isDark ? t("lightMode") : t("darkMode")}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
