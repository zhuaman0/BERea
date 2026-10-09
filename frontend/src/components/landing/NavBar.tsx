"use client";

import { useState, useEffect } from "react";
const NAV_LINKS: { label: string; href: string }[] = [
  { label: "Каталог",          href: "/catalog" },
  { label: "Конфигуратор",     href: "/configurator" },
  { label: "Как это работает", href: "#process" },
  { label: "Контакты",         href: "#contacts" },
];

export function NavBar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 72);
    window.addEventListener("scroll", handle, { passive: true });
    handle();
    return () => window.removeEventListener("scroll", handle);
  }, []);

  const text = scrolled ? "text-stone-900" : "text-white";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-[0_1px_0_rgba(0,0,0,0.06)]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 h-[72px] flex items-center justify-between">
        <a
          href="/furniture"
          className={`text-sm font-light tracking-[0.28em] uppercase transition-colors duration-500 ${text}`}
        >
          Мебель Studio
        </a>

        <nav className="hidden lg:flex items-center gap-12">
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className={`text-[11px] font-medium tracking-[0.18em] uppercase transition-all duration-300 hover:opacity-100 opacity-70 ${text}`}
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          <a
            href="tel:+77001234567"
            className={`hidden sm:block text-[12px] font-light tracking-wide transition-all duration-300 opacity-70 hover:opacity-100 ${text}`}
          >
            +7 700 123 45 67
          </a>
          <a
            href="/register"
            className={`text-[11px] font-semibold tracking-widest uppercase px-5 py-2.5 border transition-all duration-300 ${
              scrolled
                ? "border-stone-900 text-stone-900 hover:bg-stone-900 hover:text-white"
                : "border-white/70 text-white hover:bg-white hover:text-stone-900"
            }`}
          >
            Создать дизайн
          </a>
        </div>
      </div>
    </header>
  );
}
