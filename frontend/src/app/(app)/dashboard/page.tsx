"use client";

import Link from "next/link";
import { ArrowRight, ShoppingBag, Sofa, BookMarked, Phone } from "lucide-react";
import { useAuthStore } from "@/features/auth/store/useAuthStore";

const QUICK_ACTIONS = [
  {
    href:    "/configurator",
    icon:    Sofa,
    label:   "Конфигуратор",
    desc:    "Создать новую мебель",
    bg:      "bg-slate-900",
    text:    "text-white",
    iconBg:  "bg-white/10",
  },
  {
    href:    "/catalog",
    icon:    ShoppingBag,
    label:   "Каталог",
    desc:    "Смотреть все товары",
    bg:      "bg-white",
    text:    "text-slate-900",
    iconBg:  "bg-slate-50",
  },
  {
    href:    "/my-designs",
    icon:    BookMarked,
    label:   "Мои дизайны",
    desc:    "Сохранённые конфигурации",
    bg:      "bg-white",
    text:    "text-slate-900",
    iconBg:  "bg-slate-50",
  },
] as const;

interface Feature {
  icon: string;
  title: string;
  desc: string;
  href: string;
  cta: string;
  disabled?: boolean;
}

const FEATURES: Feature[] = [
  {
    icon:  "✏️",
    title: "3D Конфигуратор",
    desc:  "Соберите мебель онлайн. Выберите размер, цвет, фасады и фурнитуру.",
    href:  "/configurator",
    cta:   "Открыть",
  },
  {
    icon:     "🏠",
    title:    "AI Визуализатор",
    desc:     "Загрузите фото комнаты — AI покажет вашу мебель у вас дома.",
    href:     "/configurator",
    cta:      "Скоро",
    disabled: true,
  },
  {
    icon:  "📐",
    title: "Бесплатный замер",
    desc:  "Наш мастер приедет и сделает точные замеры. Бесплатно.",
    href:  "#contact",
    cta:   "Записаться",
  },
];

export default function DashboardPage() {
  const { user } = useAuthStore();

  const firstName = user?.full_name?.split(" ")[0] ?? "Привет";

  return (
    <div className="p-6 md:p-8 max-w-5xl">

      {/* Greeting */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900">
          Добро пожаловать, {firstName} 👋
        </h1>
        <p className="text-slate-500 mt-1">Создайте мебель вашей мечты прямо сейчас</p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {QUICK_ACTIONS.map(({ href, icon: Icon, label, desc, bg, text, iconBg }) => (
          <Link
            key={href}
            href={href}
            className={`group flex items-center gap-4 p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${bg} ${text}`}
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
              <Icon size={20} strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm leading-none">{label}</p>
              <p className={`text-xs mt-1 ${bg === "bg-slate-900" ? "text-slate-400" : "text-slate-500"}`}>
                {desc}
              </p>
            </div>
            <ArrowRight size={16} className="ml-auto shrink-0 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
          </Link>
        ))}
      </div>

      {/* Features */}
      <div className="mb-10">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Наши возможности</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FEATURES.map(({ icon, title, desc, href, cta, disabled }) => (
            <div
              key={title}
              className="flex flex-col p-5 rounded-2xl border border-slate-100 bg-white shadow-sm"
            >
              <span className="text-2xl mb-3">{icon}</span>
              <h3 className="font-bold text-slate-900 mb-1">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed flex-1 mb-4">{desc}</p>
              {disabled ? (
                <span className="self-start text-xs font-semibold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg">
                  {cta}
                </span>
              ) : (
                <a
                  href={href}
                  className="self-start text-xs font-semibold text-slate-900 hover:text-slate-600 transition-colors flex items-center gap-1"
                >
                  {cta} <ArrowRight size={12} />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact banner */}
      <div id="contact" className="bg-slate-900 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <h3 className="font-bold text-white text-lg">Нужна консультация?</h3>
          <p className="text-slate-400 text-sm mt-0.5">
            Позвоните нам — бесплатно расскажем о возможностях и ценах.
          </p>
        </div>
        <a
          href="tel:+77001234567"
          className="shrink-0 flex items-center gap-2 bg-white text-slate-900 font-semibold px-5 py-2.5 rounded-xl hover:bg-slate-100 transition-colors text-sm"
        >
          <Phone size={15} />
          +7 700 123 45 67
        </a>
      </div>
    </div>
  );
}
