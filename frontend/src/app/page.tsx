import Link from "next/link";
import { ArrowRight, Phone, MapPin, Star, CheckCircle } from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { icon: "🍳", label: "Кухни",       desc: "Модульные и корпусные",   href: "/catalog?cat=kitchen"    },
  { icon: "🛋️",  label: "Гостиные",    desc: "Стенки, шкафы, горки",   href: "/catalog?cat=living"     },
  { icon: "🛏️",  label: "Спальни",     desc: "Шкафы-купе, комоды",     href: "/catalog?cat=bedroom"    },
  { icon: "🚪",  label: "Прихожие",    desc: "Шкафы, вешалки, пуфы",   href: "/catalog?cat=hallway"    },
  { icon: "💼",  label: "Офис",        desc: "Стеллажи, рабочие зоны", href: "/catalog?cat=office"     },
  { icon: "🚿",  label: "Ванная",      desc: "Тумбы, зеркала, полки",  href: "/catalog?cat=bathroom"   },
] as const;

const FEATURES = [
  {
    icon:  "✏️",
    title: "3D Конфигуратор",
    desc:  "Соберите мебель онлайн — выберите размер, цвет, фасады и фурнитуру. Сразу видите результат.",
  },
  {
    icon:  "🏠",
    title: "AI Визуализатор комнаты",
    desc:  "Загрузите фото своей комнаты — AI покажет как будет выглядеть ваша мебель именно у вас дома.",
  },
  {
    icon:  "📐",
    title: "Бесплатный замер",
    desc:  "Наш мастер приедет и сделает точные замеры. Бесплатно в Алматы и пригороде.",
  },
  {
    icon:  "🔧",
    title: "Производство в Казахстане",
    desc:  "Делаем сами — без посредников. Контроль качества на каждом этапе.",
  },
  {
    icon:  "🚚",
    title: "Доставка и сборка",
    desc:  "Привезём и соберём за 1 день. Гарантия на сборку и материалы 3 года.",
  },
  {
    icon:  "💳",
    title: "Рассрочка 0%",
    desc:  "Оформляем рассрочку на 6-24 месяца без переплат и банковских комиссий.",
  },
] as const;

const TESTIMONIALS = [
  {
    quote:    "Заказали кухню через конфигуратор — всё точно как мы хотели. Приехали, замерили, сделали за 3 недели. Очень доволен!",
    name:     "Алибек М.",
    location: "Алматы",
    initials: "АМ",
    rating:   5,
  },
  {
    quote:    "Сначала не верил в онлайн-конфигуратор, но попробовал — и это реально удобно. Видишь всё в 3D и сразу знаешь цену.",
    name:     "Дмитрий В.",
    location: "Алматы",
    initials: "ДВ",
    rating:   5,
  },
  {
    quote:    "Шкаф-купе в спальню сделали точно по нашим размерам. Качество отличное, мастера работали аккуратно. Рекомендую!",
    name:     "Айгерим С.",
    location: "Астана",
    initials: "АС",
    rating:   5,
  },
] as const;

const HOW_IT_WORKS = [
  {
    step:  "01",
    title: "Выберите мебель",
    desc:  "Откройте каталог или конфигуратор — выберите категорию и настройте под себя.",
    icon:  "🛋️",
  },
  {
    step:  "02",
    title: "Получите расчёт",
    desc:  "Цена считается автоматически. Оставьте заявку — перезвоним и уточним детали.",
    icon:  "📋",
  },
  {
    step:  "03",
    title: "Мы делаем и доставляем",
    desc:  "Замер → производство → доставка и сборка. Вы просто ждёте и принимаете готовую мебель.",
    icon:  "✅",
  },
] as const;

// ─── Components ───────────────────────────────────────────────────────────────

function Nav() {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-white text-sm font-bold">
            M
          </div>
          <span className="text-lg font-bold text-slate-900 tracking-tight">Мебель Studio</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link href="/catalog" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Каталог
          </Link>
          <Link href="/configurator" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Конфигуратор
          </Link>
          <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Как это работает
          </a>
          <a href="#contacts" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Контакты
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="tel:+77001234567"
            className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
          >
            <Phone size={15} />
            +7 700 123 45 67
          </a>
          <Link
            href="/register"
            className="px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors"
          >
            Создать дизайн
          </Link>
        </div>
      </div>
    </header>
  );
}

function HeroVisual() {
  return (
    <div className="relative w-full max-w-[480px] mx-auto">
      {/* Main room card */}
      <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/60 overflow-hidden">
        {/* Room preview */}
        <div className="aspect-[4/3] bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center relative">
          <div className="text-center space-y-2">
            <div className="text-7xl">🪑</div>
            <p className="text-xs text-slate-400 font-medium">3D предпросмотр</p>
          </div>

          {/* AI badge */}
          <div className="absolute top-4 left-4 bg-white rounded-xl px-3 py-1.5 shadow-md flex items-center gap-1.5">
            <span className="text-sm">✨</span>
            <span className="text-xs font-semibold text-slate-700">AI визуализация</span>
          </div>
        </div>

        {/* Config summary */}
        <div className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs text-slate-400 font-medium mb-0.5">Кухонный гарнитур</p>
              <p className="font-bold text-slate-900">Белый глянец, хром</p>
            </div>
            <span className="text-lg font-black text-slate-900">285 000 ₸</span>
          </div>

          <div className="flex gap-2">
            {["Белый", "Серый", "#2D2D2D", "#8B4513"].map((color, i) => (
              <div
                key={i}
                className="w-7 h-7 rounded-lg border-2 border-white shadow-sm"
                style={{ backgroundColor: ["#FFFFFF", "#E2E8F0", "#2D2D2D", "#8B4513"][i] }}
              />
            ))}
            <div className="w-7 h-7 rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 text-xs">
              +
            </div>
          </div>
        </div>
      </div>

      {/* Floating badge — top right */}
      <div className="absolute -top-4 -right-4 bg-emerald-500 text-white rounded-2xl px-4 py-2.5 shadow-lg shadow-emerald-200">
        <p className="text-xs font-bold uppercase tracking-wide">Бесплатный</p>
        <p className="text-sm font-black">замер</p>
      </div>

      {/* Floating badge — bottom left */}
      <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl px-4 py-2.5 flex items-center gap-2">
        <div className="flex -space-x-1">
          {["bg-blue-400", "bg-purple-400", "bg-amber-400"].map((c, i) => (
            <div key={i} className={`w-6 h-6 ${c} rounded-full border-2 border-white`} />
          ))}
        </div>
        <div>
          <p className="text-xs font-bold text-slate-900">500+ клиентов</p>
          <p className="text-[10px] text-slate-400">в Казахстане</p>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="bg-white text-slate-900 min-h-screen">
      <Nav />

      <main>

        {/* ══ Hero ══════════════════════════════════════════════════════════ */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

            <div className="flex flex-col items-start gap-6">
              <span className="inline-flex items-center gap-1.5 bg-slate-900 text-white text-xs font-semibold px-4 py-1.5 rounded-full">
                🏆 Мебель №1 в Казахстане
              </span>

              <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 tracking-tight leading-[1.08]">
                Мебель вашей
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-500">
                  мечты — онлайн
                </span>
              </h1>

              <p className="text-lg text-slate-500 max-w-md leading-relaxed">
                Соберите мебель в 3D конфигураторе, увидьте её в своей комнате
                с помощью AI — и закажите с доставкой по всему Казахстану.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/configurator"
                  className="inline-flex items-center gap-2 bg-slate-900 text-white font-semibold px-7 py-3.5 rounded-2xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200 text-base"
                >
                  Открыть конфигуратор <ArrowRight size={16} />
                </Link>
                <Link
                  href="/catalog"
                  className="inline-flex items-center gap-2 bg-white text-slate-700 font-medium px-6 py-3.5 rounded-2xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors text-base shadow-sm"
                >
                  Смотреть каталог
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-5 text-sm text-slate-400">
                <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-emerald-500" /> Бесплатный замер</span>
                <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-emerald-500" /> Рассрочка 0%</span>
                <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-emerald-500" /> Гарантия 3 года</span>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end pr-8">
              <HeroVisual />
            </div>
          </div>
        </section>

        {/* ══ Categories ════════════════════════════════════════════════════ */}
        <section className="bg-slate-50 py-24 border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
                Каталог мебели
              </h2>
              <p className="text-slate-500 max-w-md mx-auto">
                Более 200 моделей. Любые размеры и цвета. Производство в Казахстане.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {CATEGORIES.map(({ icon, label, desc, href }) => (
                <Link
                  key={label}
                  href={href}
                  className="group flex flex-col items-center gap-3 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-center"
                >
                  <span className="text-3xl">{icon}</span>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ══ Features ══════════════════════════════════════════════════════ */}
        <section className="py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
                Почему выбирают нас
              </h2>
              <p className="text-slate-500 max-w-md mx-auto">
                Технологии + казахстанское качество = мебель на 20 лет
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURES.map(({ icon, title, desc }) => (
                <div
                  key={title}
                  className="flex flex-col gap-4 p-7 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <span className="text-3xl">{icon}</span>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg mb-2">{title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ How it works ══════════════════════════════════════════════════ */}
        <section id="how-it-works" className="bg-slate-900 py-28 text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Как это работает
            </h2>
            <p className="text-slate-400 max-w-md mx-auto mb-20">
              От первого клика до готовой мебели у вас дома — просто и прозрачно
            </p>

            <div className="grid md:grid-cols-3 gap-10 relative">
              <div
                className="hidden md:block absolute top-[2.5rem] left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px bg-slate-700"
                aria-hidden="true"
              />
              {HOW_IT_WORKS.map(({ step, title, desc, icon }) => (
                <div key={step} className="flex flex-col items-center gap-4 relative">
                  <span className="absolute -top-3 text-8xl font-black text-slate-800 leading-none select-none pointer-events-none">
                    {step}
                  </span>
                  <div className="relative z-10 w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center text-2xl shadow-md">
                    {icon}
                  </div>
                  <h3 className="font-semibold text-white text-lg">{title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed max-w-xs mx-auto">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ Testimonials ══════════════════════════════════════════════════ */}
        <section className="py-28 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
                Отзывы наших клиентов
              </h2>
              <p className="text-slate-500">Более 500 довольных семей по всему Казахстану</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TESTIMONIALS.map(({ quote, name, location, initials, rating }) => (
                <div
                  key={name}
                  className="flex flex-col p-7 rounded-3xl bg-white border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="flex gap-0.5 mb-5">
                    {Array.from({ length: rating }).map((_, i) => (
                      <Star key={i} size={14} fill="#0f172a" stroke="none" />
                    ))}
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed flex-1 mb-5">
                    &ldquo;{quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3 pt-5 border-t border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 leading-none">{name}</p>
                      <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                        <MapPin size={10} /> {location}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ CTA Banner ════════════════════════════════════════════════════ */}
        <section className="bg-slate-900 py-20 px-4 sm:px-6 text-center">
          <div className="max-w-2xl mx-auto flex flex-col items-center gap-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Начните создавать прямо сейчас
            </h2>
            <p className="text-slate-400 leading-relaxed max-w-md">
              Конфигуратор бесплатный. Замер бесплатный. Вы ничем не рискуете.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/configurator"
                className="inline-flex items-center gap-2 bg-white text-slate-900 font-semibold px-8 py-4 rounded-2xl hover:bg-slate-100 transition-colors text-base shadow-lg"
              >
                Открыть конфигуратор <ArrowRight size={16} />
              </Link>
              <a
                href="tel:+77001234567"
                className="inline-flex items-center gap-2 border border-slate-700 text-white font-medium px-8 py-4 rounded-2xl hover:bg-slate-800 transition-colors text-base"
              >
                <Phone size={16} /> Позвонить нам
              </a>
            </div>
          </div>
        </section>

      </main>

      {/* ══ Footer ════════════════════════════════════════════════════════════ */}
      <footer id="contacts" className="bg-[#080f1e] text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">

            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-slate-900 font-bold text-sm">
                  M
                </div>
                <span className="text-white font-bold text-lg">Мебель Studio</span>
              </div>
              <p className="text-sm leading-relaxed max-w-[220px]">
                Производство мебели под заказ в Казахстане. Онлайн-конфигуратор и AI визуализация.
              </p>
              <div className="flex flex-col gap-2 text-sm">
                <a href="tel:+77001234567" className="flex items-center gap-2 hover:text-white transition-colors">
                  <Phone size={14} /> +7 700 123 45 67
                </a>
                <span className="flex items-center gap-2">
                  <MapPin size={14} /> Алматы, Казахстан
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-white text-[11px] font-bold tracking-[0.18em] uppercase mb-6">Продукты</h3>
              <ul className="flex flex-col gap-4 text-sm">
                {["Кухни", "Гостиные", "Спальни", "Прихожие", "Офисная мебель"].map((item) => (
                  <li key={item}><a href="#" className="hover:text-white transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-white text-[11px] font-bold tracking-[0.18em] uppercase mb-6">Сервисы</h3>
              <ul className="flex flex-col gap-4 text-sm">
                {["3D Конфигуратор", "AI Визуализатор", "Бесплатный замер", "Доставка и сборка", "Рассрочка"].map((item) => (
                  <li key={item}><a href="#" className="hover:text-white transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-white text-[11px] font-bold tracking-[0.18em] uppercase mb-6">Компания</h3>
              <ul className="flex flex-col gap-4 text-sm">
                {["О нас", "Наши работы", "Отзывы", "Партнёрам", "Контакты"].map((item) => (
                  <li key={item}><a href="#" className="hover:text-white transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <p className="text-center text-slate-500 text-sm">© 2026 Мебель Studio. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
