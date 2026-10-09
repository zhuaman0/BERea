"use client";

import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { useAuthStore } from "@/features/auth/store/useAuthStore";

const QUICK_ACTIONS = [
  {
    href:  "/configurator",
    label: "Конфигуратор",
    desc:  "Создать новую мебель",
    dark:  true,
  },
  {
    href:  "/catalog",
    label: "Каталог",
    desc:  "Смотреть все товары",
    dark:  false,
  },
  {
    href:  "/my-designs",
    label: "Мои дизайны",
    desc:  "Сохранённые конфигурации",
    dark:  false,
  },
] as const;

interface Feature {
  num:      string;
  title:    string;
  desc:     string;
  href:     string;
  cta:      string;
  disabled?: boolean;
}

const FEATURES: Feature[] = [
  {
    num:   "01",
    title: "3D Конфигуратор",
    desc:  "Соберите мебель онлайн. Выберите размер, цвет, фасады и фурнитуру.",
    href:  "/configurator",
    cta:   "Открыть",
  },
  {
    num:      "02",
    title:    "AI Визуализатор",
    desc:     "Загрузите фото комнаты — AI покажет вашу мебель у вас дома.",
    href:     "/configurator",
    cta:      "Скоро",
    disabled: true,
  },
  {
    num:   "03",
    title: "Бесплатный замер",
    desc:  "Наш мастер приедет и сделает точные замеры. Бесплатно для Алматы.",
    href:  "#contact",
    cta:   "Записаться",
  },
];

export default function DashboardPage() {
  const { user } = useAuthStore();
  const firstName = user?.full_name?.split(" ")[0] ?? "Привет";

  return (
    <div className="p-6 md:p-10 max-w-4xl">

      {/* Greeting */}
      <div className="mb-10 pb-8 border-b border-stone-100">
        <p className="text-[11px] tracking-[0.25em] uppercase text-stone-400 mb-2">
          Добро пожаловать
        </p>
        <h1 className="text-3xl font-extralight text-stone-900">
          {firstName}
        </h1>
        <p className="text-stone-400 text-sm mt-1 font-light">
          Создайте мебель вашей мечты прямо сейчас
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
        {QUICK_ACTIONS.map(({ href, label, desc, dark }) => (
          <Link
            key={href}
            href={href}
            className={`group flex items-center justify-between gap-3 px-5 py-4 border transition-all duration-200 hover:-translate-y-0.5 ${
              dark
                ? "bg-stone-900 border-stone-900 text-white hover:bg-stone-800"
                : "bg-white border-stone-200 text-stone-900 hover:border-stone-400"
            }`}
          >
            <div>
              <p className={`text-sm font-medium ${dark ? "text-white" : "text-stone-900"}`}>
                {label}
              </p>
              <p className={`text-[11px] mt-0.5 ${dark ? "text-stone-400" : "text-stone-400"}`}>
                {desc}
              </p>
            </div>
            <ArrowRight
              size={15}
              className="shrink-0 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200"
            />
          </Link>
        ))}
      </div>

      {/* Features */}
      <div className="mb-10">
        <p className="text-[11px] tracking-[0.22em] uppercase text-stone-400 mb-5">
          Наши возможности
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FEATURES.map(({ num, title, desc, href, cta, disabled }) => (
            <div
              key={title}
              className="group flex flex-col p-5 border border-stone-100 bg-white hover:border-stone-300 transition-colors duration-200"
            >
              <span className="text-[10px] tracking-[0.25em] uppercase text-stone-300 mb-4">
                {num}
              </span>
              <h3 className="text-[15px] font-light text-stone-900 mb-2">{title}</h3>
              <p className="text-[13px] text-stone-400 leading-relaxed flex-1 mb-5 font-light">
                {desc}
              </p>
              {disabled ? (
                <span className="self-start text-[10px] tracking-widest uppercase font-medium text-stone-300 border border-stone-100 px-3 py-1.5">
                  {cta}
                </span>
              ) : (
                <a
                  href={href}
                  className="self-start inline-flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase font-semibold text-stone-900 hover:gap-3 transition-all duration-200"
                >
                  {cta} <ArrowRight size={11} />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact banner */}
      <div
        id="contact"
        className="bg-stone-900 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5"
      >
        <div className="flex-1">
          <p className="text-[10px] tracking-[0.22em] uppercase text-stone-500 mb-1.5">
            Консультация
          </p>
          <h3 className="font-light text-white text-lg">Нужна помощь с выбором?</h3>
          <p className="text-stone-400 text-[13px] mt-0.5 font-light">
            Позвоните — бесплатно расскажем о возможностях и ценах.
          </p>
        </div>
        <a
          href="tel:+77001234567"
          className="shrink-0 flex items-center gap-2 border border-stone-700 text-white text-[11px] font-semibold tracking-widest uppercase px-5 py-3 hover:border-stone-400 transition-colors duration-200"
        >
          <Phone size={13} />
          +7 700 123 45 67
        </a>
      </div>

    </div>
  );
}
