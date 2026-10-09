"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Phone, MapPin } from "lucide-react";
import { NavBar } from "@/components/landing/NavBar";

// ─── Data ─────────────────────────────────────────────────────────────────────

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1920&q=90";

const CATEGORIES_MAIN = [
  {
    label: "Кухни",
    sub:   "Коллекция / 01",
    desc:  "Модульные гарнитуры, кухонные острова, открытые полки. Производим под любые размеры и планировки.",
    href:  "/catalog?cat=kitchen",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1400&q=85",
  },
  {
    label: "Гостиные",
    sub:   "Коллекция / 02",
    desc:  "Стенки, горки, шкафы-купе и открытые стеллажи. Пространство, в котором хочется жить.",
    href:  "/catalog?cat=living",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1400&q=85",
  },
  {
    label: "Спальни",
    sub:   "Коллекция / 03",
    desc:  "Шкафы-купе, комоды и прикроватные тумбы. Уют и хранение в едином решении.",
    href:  "/catalog?cat=bedroom",
    image: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1400&q=85",
  },
] as const;

const CATEGORIES_SMALL = [
  {
    label: "Прихожие",
    href:  "/catalog?cat=hallway",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=900&q=85",
  },
  {
    label: "Офис",
    href:  "/catalog?cat=office",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=85",
  },
  {
    label: "Ванная",
    href:  "/catalog?cat=bathroom",
    image: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=900&q=85",
  },
] as const;

const STATS = [
  { value: "500+",    label: "Довольных клиентов" },
  { value: "3 года",  label: "Гарантия на мебель" },
  { value: "10 лет",  label: "На рынке Казахстана" },
  { value: "20 дней", label: "Среднее производство" },
] as const;

const FEATURES = [
  {
    num:   "01",
    title: "3D Конфигуратор",
    desc:  "Соберите мебель онлайн — выберите размер, цвет, фасады и фурнитуру. Цена считается автоматически.",
  },
  {
    num:   "02",
    title: "AI Визуализатор",
    desc:  "Загрузите фото своей комнаты — AI покажет, как будет выглядеть ваша мебель именно у вас дома.",
  },
  {
    num:   "03",
    title: "Производство в КЗ",
    desc:  "Делаем сами, без посредников. Полный контроль качества от заготовки до финишного покрытия.",
  },
  {
    num:   "04",
    title: "Бесплатный замер",
    desc:  "Наш мастер приедет и снимет точные замеры. Бесплатно для Алматы и пригорода.",
  },
  {
    num:   "05",
    title: "Доставка и сборка",
    desc:  "Привезём и соберём за один день. Гарантия на сборку и материалы — 3 года.",
  },
  {
    num:   "06",
    title: "Рассрочка 0%",
    desc:  "Оформляем рассрочку на 6–24 месяца без переплат и банковских комиссий.",
  },
] as const;

const PROCESS = [
  {
    step:  "01",
    title: "Выберите мебель",
    desc:  "Каталог или конфигуратор — выберите категорию, настройте под себя. Цена сразу на экране.",
  },
  {
    step:  "02",
    title: "Получите расчёт",
    desc:  "Оставьте заявку — мы перезвоним, уточним детали и подтвердим стоимость.",
  },
  {
    step:  "03",
    title: "Мы делаем всё остальное",
    desc:  "Замер → производство → доставка и сборка. Вы просто ждёте и принимаете готовую мебель.",
  },
] as const;

const TESTIMONIALS = [
  {
    quote:    "Заказали кухню через конфигуратор — всё точно как мы хотели. Замерили, сделали за 3 недели. Очень доволен!",
    name:     "Алибек М.",
    location: "Алматы",
  },
  {
    quote:    "Онлайн-конфигуратор — реально удобно. Видишь всё в 3D и сразу знаешь цену. Рекомендую!",
    name:     "Дмитрий В.",
    location: "Алматы",
  },
  {
    quote:    "Шкаф-купе в спальню сделали точно по размерам. Качество отличное, мастера работали аккуратно.",
    name:     "Айгерим С.",
    location: "Астана",
  },
] as const;

const MARQUEE_ITEMS = [
  "Производство в Казахстане",
  "Доставка по всему КЗ",
  "Гарантия 3 года",
  "Бесплатный замер",
  "Рассрочка 0%",
  "3D Конфигуратор",
  "AI Визуализация",
];

// ─── Animation helpers ─────────────────────────────────────────────────────────

const fadeUp = (delay = 0) => ({
  initial:     { opacity: 0, y: 48 },
  whileInView: { opacity: 1, y: 0 },
  viewport:    { once: true, margin: "-80px" },
  transition:  { duration: 1, ease: [0.16, 1, 0.3, 1] as [number,number,number,number], delay },
});

const fadeIn = (delay = 0) => ({
  initial:     { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport:    { once: true, margin: "-60px" },
  transition:  { duration: 0.9, ease: [0, 0, 0.58, 1] as [number,number,number,number], delay },
});

// ─── Marquee ──────────────────────────────────────────────────────────────────

function Marquee() {
  const text = MARQUEE_ITEMS.map((t) => `${t}  ·  `).join("");
  return (
    <div className="overflow-hidden bg-stone-900 py-[14px] select-none">
      <div className="flex animate-marquee whitespace-nowrap">
        {[0, 1].map((i) => (
          <span
            key={i}
            className="shrink-0 text-[11px] font-medium tracking-[0.22em] uppercase text-white/40 pr-0"
          >
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Editorial category card (alternating) ────────────────────────────────────

interface MainCatProps {
  label: string;
  sub:   string;
  desc:  string;
  href:  string;
  image: string;
  index: number;
}

function CategoryCard({ label, sub, desc, href, image, index }: MainCatProps) {
  const isReversed = index % 2 !== 0;

  return (
    <motion.div
      {...fadeIn(0)}
      className={`flex flex-col ${isReversed ? "lg:flex-row-reverse" : "lg:flex-row"} min-h-[56vh]`}
    >
      {/* image side */}
      <a
        href={href}
        className="group relative flex-[0_0_58%] overflow-hidden cursor-pointer block"
        aria-label={label}
      >
        <Image
          src={image}
          alt={label}
          fill
          sizes="(max-width: 1024px) 100vw, 58vw"
          className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.06] will-change-transform"
        />
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-700" />
      </a>

      {/* text side */}
      <div
        className={`flex-1 flex flex-col justify-center px-10 lg:px-16 xl:px-20 py-16 ${
          isReversed ? "bg-stone-100" : "bg-[#FAFAF8]"
        }`}
      >
        <motion.span
          {...fadeUp(0.1)}
          className="text-[10px] tracking-[0.3em] uppercase text-stone-400 mb-5 block"
        >
          {sub}
        </motion.span>

        <motion.h3
          {...fadeUp(0.18)}
          className="text-5xl lg:text-6xl font-extralight text-stone-900 leading-[1.05] mb-6"
        >
          {label}
        </motion.h3>

        <motion.p
          {...fadeUp(0.26)}
          className="text-stone-500 text-[15px] leading-relaxed max-w-[320px] mb-10"
        >
          {desc}
        </motion.p>

        <motion.div {...fadeUp(0.34)}>
          <a
            href={href}
            className="inline-flex items-center gap-3 text-[11px] font-semibold tracking-[0.2em] uppercase text-stone-900 group/link"
          >
            <span className="border-b border-stone-900 pb-0.5 group-hover/link:pr-2 transition-all duration-300">
              Смотреть коллекцию
            </span>
            <ArrowRight size={13} className="group-hover/link:translate-x-1 transition-transform duration-300" />
          </a>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── Small category card ───────────────────────────────────────────────────────

interface SmallCatProps {
  label: string;
  href:  string;
  image: string;
}

function SmallCard({ label, href, image }: SmallCatProps) {
  return (
    <a href={href} className="group relative overflow-hidden block aspect-[3/4]">
      <Image
        src={image}
        alt={label}
        fill
        sizes="(max-width: 768px) 100vw, 33vw"
        className="object-cover transition-transform duration-[1100ms] ease-out group-hover:scale-[1.07] will-change-transform"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
      <div className="absolute bottom-0 left-0 p-7">
        <p className="text-[10px] tracking-[0.28em] uppercase text-white/60 mb-1.5">Категория</p>
        <h4 className="text-2xl font-extralight text-white">{label}</h4>
      </div>
      <div className="absolute bottom-7 right-7 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <ArrowRight size={18} className="text-white" />
      </div>
    </a>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="bg-[#FAFAF8] text-stone-900 min-h-screen">
      <NavBar />

      {/* ══ Hero ══ Split screen ════════════════════════════════════════════ */}
      <section className="grid grid-cols-1 lg:grid-cols-2">

        {/* ─ Left: dark text panel ─────────────────────────────────────── */}
        <div className="relative flex flex-col gap-8 bg-[#0C0C0C] px-10 md:px-14 xl:px-20 pt-28 pb-12">
          <div className="absolute top-[72px] left-8 right-8 h-px bg-stone-800/60" aria-hidden="true" />

          {/* label */}
          <motion.span
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-[10px] tracking-[0.35em] uppercase text-stone-500 mt-4"
          >
            Мебель под заказ · Казахстан
          </motion.span>

          {/* headline */}
          <motion.h1
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
            className="font-extralight text-white leading-[0.93] tracking-tight"
            style={{ fontSize: "clamp(2.6rem, 4.2vw, 4.4rem)" }}
          >
            Мебель<br />
            <span className="text-stone-500 italic">вашей</span><br />
            мечты
          </motion.h1>

          {/* desc + CTAs + trust */}
          <div className="flex flex-col gap-5">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="text-stone-400 text-[14px] leading-relaxed max-w-[270px] font-light"
            >
              3D конфигуратор. AI визуализация.<br />Производство в Казахстане.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.7 }}
              className="flex flex-wrap gap-3"
            >
              <a
                href="/catalog"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-stone-900 text-[11px] font-semibold tracking-widest uppercase hover:bg-stone-100 transition-colors duration-300"
              >
                Каталог
              </a>
              <a
                href="/configurator"
                className="inline-flex items-center gap-2 px-8 py-3.5 border border-stone-700 text-white text-[11px] font-semibold tracking-widest uppercase hover:border-stone-400 transition-colors duration-300"
              >
                Конфигуратор
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1 }}
              className="flex flex-wrap items-center gap-3 text-[10px] tracking-[0.18em] uppercase text-stone-600"
            >
              {["Бесплатный замер", "Рассрочка 0%", "Гарантия 3 года"].map((t, i) => (
                <span key={t} className="flex items-center gap-3">
                  {i !== 0 && <span className="text-stone-800">·</span>}
                  {t}
                </span>
              ))}
            </motion.div>
          </div>

          {/* scroll hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6, duration: 1 }}
            className="absolute bottom-8 right-8 flex flex-col items-center gap-2"
          >
            <div className="w-px h-12 bg-stone-700 relative overflow-hidden">
              <motion.div
                className="absolute top-0 left-0 right-0 h-1/2 bg-stone-400"
                animate={{ y: ["0%", "200%"] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
            <span className="text-[8px] tracking-[0.3em] uppercase text-stone-600 rotate-90 mt-1">
              scroll
            </span>
          </motion.div>
        </div>

        {/* ─ Right: floating image windows ─────────────────────────────── */}
        <div className="relative overflow-hidden bg-stone-900 min-h-[480px]">
          {/* main background image */}
          <Image
            src={HERO_IMAGE}
            alt="Современный интерьер"
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          {/* left-edge bleed into dark panel */}
          <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#0C0C0C]/50 to-transparent" />

          {/* ── Floating stat card ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="absolute bottom-6 left-6 z-10"
          >
            <motion.div
              animate={{ y: [0, -7, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
              className="bg-white/95 backdrop-blur-sm px-4 py-3"
            >
              <p className="text-xl xl:text-2xl font-extralight text-stone-900 leading-none">500+</p>
              <p className="text-[8px] tracking-[0.22em] uppercase text-stone-400 mt-1">клиентов в КЗ</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ══ Marquee ticker ════════════════════════════════════════════════════ */}
      <Marquee />

      {/* ══ Categories header ═════════════════════════════════════════════════ */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-12 pt-28 pb-16 text-center">
        <motion.span
          {...fadeUp(0)}
          className="text-[10px] tracking-[0.3em] uppercase text-stone-400 block mb-5"
        >
          Коллекции
        </motion.span>
        <motion.h2
          {...fadeUp(0.1)}
          className="text-4xl sm:text-5xl lg:text-6xl font-extralight text-stone-900 leading-[1.08]"
        >
          Мебель для каждой<br />
          <span className="text-stone-400">комнаты вашего дома</span>
        </motion.h2>
      </section>

      {/* ══ Main category cards (editorial alternating) ═══════════════════════ */}
      <div>
        {CATEGORIES_MAIN.map((cat, i) => (
          <CategoryCard key={cat.label} {...cat} index={i} />
        ))}
      </div>

      {/* ══ Small category cards (3-col grid) ════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-3">
        {CATEGORIES_SMALL.map((cat) => (
          <SmallCard key={cat.label} {...cat} />
        ))}
      </div>

      {/* ══ Stats bar ═════════════════════════════════════════════════════════ */}
      <section className="bg-stone-900 py-20">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-0 lg:divide-x lg:divide-stone-700">
            {STATS.map(({ value, label }, i) => (
              <motion.div
                key={value}
                {...fadeUp(i * 0.08)}
                className="flex flex-col items-center text-center lg:px-10"
              >
                <span className="text-5xl lg:text-6xl font-extralight text-white mb-3">
                  {value}
                </span>
                <span className="text-[11px] tracking-[0.22em] uppercase text-stone-400">
                  {label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ Features ══════════════════════════════════════════════════════════ */}
      <section className="py-32 bg-[#FAFAF8]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-[1fr_2fr] gap-16 lg:gap-24 items-start">
            <motion.div {...fadeUp(0)} className="lg:sticky lg:top-28">
              <span className="text-[10px] tracking-[0.3em] uppercase text-stone-400 block mb-5">
                Почему мы
              </span>
              <h2 className="text-4xl lg:text-5xl font-extralight text-stone-900 leading-[1.1] mb-6">
                Что мы<br />предлагаем
              </h2>
              <p className="text-stone-400 text-[14px] leading-relaxed max-w-xs">
                Технологии встречаются с казахстанским производством. Каждая деталь на контроле.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-12">
              {FEATURES.map(({ num, title, desc }, i) => (
                <motion.div
                  key={num}
                  {...fadeUp(i * 0.07)}
                  className="group"
                >
                  <span className="text-[10px] tracking-[0.25em] uppercase text-stone-300 block mb-4">
                    {num}
                  </span>
                  <h3 className="text-xl font-light text-stone-900 mb-3 group-hover:text-stone-600 transition-colors duration-300">
                    {title}
                  </h3>
                  <p className="text-stone-400 text-sm leading-relaxed">{desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ Process ═══════════════════════════════════════════════════════════ */}
      <section id="process" className="bg-stone-900 py-32">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="text-center mb-20">
            <motion.span
              {...fadeUp(0)}
              className="text-[10px] tracking-[0.3em] uppercase text-stone-500 block mb-5"
            >
              Процесс
            </motion.span>
            <motion.h2
              {...fadeUp(0.1)}
              className="text-4xl sm:text-5xl font-extralight text-white leading-[1.1]"
            >
              От идеи до готовой<br />
              <span className="text-stone-500">мебели — просто</span>
            </motion.h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12 lg:gap-16 relative">
            <div
              className="hidden md:block absolute top-4 left-[calc(16.7%+1rem)] right-[calc(16.7%+1rem)] h-px bg-stone-700"
              aria-hidden="true"
            />
            {PROCESS.map(({ step, title, desc }, i) => (
              <motion.div
                key={step}
                {...fadeUp(i * 0.12)}
                className="relative text-center"
              >
                <div className="w-9 h-9 border border-stone-700 flex items-center justify-center mx-auto mb-8 relative z-10 bg-stone-900">
                  <span className="text-[10px] tracking-widest text-stone-400">{step}</span>
                </div>
                <h3 className="text-xl font-light text-white mb-4">{title}</h3>
                <p className="text-stone-400 text-sm leading-relaxed max-w-xs mx-auto">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ Testimonials ══════════════════════════════════════════════════════ */}
      <section className="py-32 bg-[#FAFAF8]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="mb-16">
            <motion.span
              {...fadeUp(0)}
              className="text-[10px] tracking-[0.3em] uppercase text-stone-400 block mb-5"
            >
              Отзывы
            </motion.span>
            <motion.h2
              {...fadeUp(0.1)}
              className="text-4xl sm:text-5xl font-extralight text-stone-900 leading-[1.1]"
            >
              Нам доверяют<br />
              <span className="text-stone-400">500+ семей в Казахстане</span>
            </motion.h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map(({ quote, name, location }, i) => (
              <motion.div
                key={name}
                {...fadeUp(i * 0.1)}
                className="border border-stone-200 p-8 hover:border-stone-400 transition-colors duration-500 group"
              >
                <p className="text-stone-500 text-[15px] leading-relaxed mb-8 font-light">
                  &ldquo;{quote}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-6 border-t border-stone-100 group-hover:border-stone-200 transition-colors duration-500">
                  <div className="w-9 h-9 bg-stone-900 flex items-center justify-center text-white text-[11px] font-semibold shrink-0">
                    {name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-900">{name}</p>
                    <p className="text-[11px] text-stone-400 flex items-center gap-1 mt-0.5">
                      <MapPin size={9} /> {location}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA full-bleed ════════════════════════════════════════════════════ */}
      <section className="relative h-[70vh] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1920&q=90"
          alt="Современный интерьер"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 text-white">
          <motion.span
            {...fadeUp(0)}
            className="text-[10px] tracking-[0.3em] uppercase text-white/50 block mb-6"
          >
            Начните сегодня
          </motion.span>
          <motion.h2
            {...fadeUp(0.1)}
            className="text-4xl sm:text-5xl lg:text-6xl font-extralight leading-[1.1] mb-8"
          >
            Создайте мебель<br />своей мечты
          </motion.h2>
          <motion.p
            {...fadeUp(0.18)}
            className="text-white/60 text-sm max-w-sm mb-12 font-light"
          >
            Конфигуратор бесплатный. Замер бесплатный. Вы ничем не рискуете.
          </motion.p>
          <motion.div
            {...fadeUp(0.26)}
            className="flex flex-wrap justify-center gap-4"
          >
            <Link
              href="/configurator"
              className="inline-flex items-center gap-3 px-9 py-4 bg-white text-stone-900 text-[11px] font-semibold tracking-widest uppercase hover:bg-stone-100 transition-colors duration-300"
            >
              Открыть конфигуратор <ArrowRight size={13} />
            </Link>
            <a
              href="tel:+77001234567"
              className="inline-flex items-center gap-3 px-9 py-4 border border-white/50 text-white text-[11px] font-semibold tracking-widest uppercase hover:bg-white/10 transition-colors duration-300"
            >
              <Phone size={13} /> Позвонить
            </a>
          </motion.div>
        </div>
      </section>

      {/* ══ Footer ════════════════════════════════════════════════════════════ */}
      <footer id="contacts" className="bg-[#0A0A0A] text-stone-500">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 pb-16 border-b border-stone-800">
            <div className="flex flex-col gap-6">
              <span className="text-white text-sm font-light tracking-[0.25em] uppercase">
                Мебель Studio
              </span>
              <p className="text-sm leading-relaxed max-w-[210px] font-light">
                Производство мебели под заказ в Казахстане. 3D конфигуратор и AI визуализация.
              </p>
              <div className="flex flex-col gap-2.5 text-sm font-light">
                <a href="tel:+77001234567" className="flex items-center gap-2 hover:text-white transition-colors duration-300">
                  <Phone size={13} /> +7 700 123 45 67
                </a>
                <span className="flex items-center gap-2">
                  <MapPin size={13} /> Алматы, Казахстан
                </span>
              </div>
            </div>

            {[
              {
                head: "Продукты",
                links: ["Кухни", "Гостиные", "Спальни", "Прихожие", "Офисная мебель"],
              },
              {
                head: "Сервисы",
                links: ["3D Конфигуратор", "AI Визуализатор", "Бесплатный замер", "Доставка и сборка", "Рассрочка"],
              },
              {
                head: "Компания",
                links: ["О нас", "Наши работы", "Отзывы", "Партнёрам", "Контакты"],
              },
            ].map(({ head, links }) => (
              <div key={head}>
                <h3 className="text-[10px] tracking-[0.22em] uppercase text-stone-600 mb-6">{head}</h3>
                <ul className="flex flex-col gap-3.5">
                  {links.map((item) => (
                    <li key={item}>
                      <a href="#" className="text-sm font-light hover:text-white transition-colors duration-300">
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-6">
          <p className="text-[11px] tracking-wide text-stone-600">
            © 2026 Мебель Studio. Все права защищены.
          </p>
        </div>
      </footer>
    </div>
  );
}
