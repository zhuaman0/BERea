"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

const CATEGORIES = ["Все", "Кухня", "Гостиная", "Спальня", "Прихожая", "Офис"] as const;
type Category = (typeof CATEGORIES)[number];

const PRODUCTS = [
  {
    id:       1,
    category: "Кухня" as Category,
    name:     "Кухонный гарнитур",
    desc:     "Модульная система, любые размеры",
    price:    250000,
    image:    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=700&q=80",
  },
  {
    id:       2,
    category: "Гостиная" as Category,
    name:     "Диван угловой",
    desc:     "Натуральная ткань, каркас из дерева",
    price:    380000,
    image:    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=700&q=80",
  },
  {
    id:       3,
    category: "Спальня" as Category,
    name:     "Шкаф-купе",
    desc:     "Зеркальные фасады, встроенная подсветка",
    price:    195000,
    image:    "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=700&q=80",
  },
  {
    id:       4,
    category: "Прихожая" as Category,
    name:     "Прихожая модульная",
    desc:     "Вешалка, обувница, зеркало в комплекте",
    price:    120000,
    image:    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=700&q=80",
  },
  {
    id:       5,
    category: "Кухня" as Category,
    name:     "Кухонный остров",
    desc:     "Встроенная техника, кварцевая столешница",
    price:    450000,
    image:    "https://images.unsplash.com/photo-1556909172-54557c7e4fb7?auto=format&fit=crop&w=700&q=80",
  },
  {
    id:       6,
    category: "Гостиная" as Category,
    name:     "Стенка под TV",
    desc:     "Под TV до 75\", открытые полки, ниши",
    price:    175000,
    image:    "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=700&q=80",
  },
  {
    id:       7,
    category: "Офис" as Category,
    name:     "Рабочий стол",
    desc:     "Массив дуба, регулируемая высота",
    price:    280000,
    image:    "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=700&q=80",
  },
  {
    id:       8,
    category: "Спальня" as Category,
    name:     "Кровать с подъёмником",
    desc:     "Подъёмный механизм, ортопедическое основание",
    price:    320000,
    image:    "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=700&q=80",
  },
] as const;

function formatPrice(n: number) {
  return n.toLocaleString("ru-RU") + " ₸";
}

export default function CatalogPage() {
  const [active, setActive] = useState<Category>("Все");

  const filtered = active === "Все"
    ? PRODUCTS
    : PRODUCTS.filter((p) => p.category === active);

  return (
    <div className="p-6 md:p-10">

      {/* Header */}
      <div className="mb-8 pb-6 border-b border-stone-100">
        <p className="text-[10px] tracking-[0.28em] uppercase text-stone-400 mb-2">
          Каталог
        </p>
        <h1 className="text-3xl font-extralight text-stone-900">
          Мебель для вашего интерьера
        </h1>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-0 mb-8 border-b border-stone-100">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`px-4 py-2.5 text-[11px] tracking-[0.15em] uppercase font-medium border-b-2 transition-all duration-150 -mb-px ${
              active === cat
                ? "border-stone-900 text-stone-900"
                : "border-transparent text-stone-400 hover:text-stone-700"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filtered.map(({ id, category, name, desc, price, image }) => (
          <div
            key={id}
            className="group bg-white border border-stone-100 hover:border-stone-300 transition-colors duration-200 flex flex-col"
          >
            {/* Image */}
            <div className="relative aspect-square overflow-hidden bg-stone-50 m-3">
              <Image
                src={image}
                alt={name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
              />
            </div>

            {/* Info */}
            <div className="flex flex-col flex-1 px-5 pt-2 pb-5">
              <p className="text-[9px] tracking-[0.25em] uppercase text-stone-400 mb-2">
                {category}
              </p>
              <h3 className="text-[14px] font-light text-stone-900 mb-1.5">{name}</h3>
              <p className="text-[12px] text-stone-400 font-light flex-1 mb-5 leading-relaxed">{desc}</p>

              <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                <span className="text-[13px] font-medium text-stone-900">
                  от {formatPrice(price)}
                </span>
                <button className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.15em] uppercase font-semibold text-stone-500 hover:text-stone-900 transition-colors duration-150 group/btn">
                  Подробнее
                  <ArrowRight size={10} className="group-hover/btn:translate-x-0.5 transition-transform duration-150" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-20">
          <p className="text-[11px] tracking-widest uppercase text-stone-300">
            Товары не найдены
          </p>
        </div>
      )}
    </div>
  );
}
