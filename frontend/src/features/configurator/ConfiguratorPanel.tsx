"use client";

import { cn } from "@/shared/lib/utils";
import {
  useConfiguratorStore,
  COLORS,
  HANDLES,
  type FurnitureCategory,
} from "./useConfiguratorStore";

const CATEGORIES: { id: FurnitureCategory; label: string; icon: string }[] = [
  { id: "kitchen",  label: "Кухня",     icon: "🍳" },
  { id: "living",   label: "Гостиная",  icon: "🛋️"  },
  { id: "bedroom",  label: "Спальня",   icon: "🛏️"  },
  { id: "hallway",  label: "Прихожая",  icon: "🚪" },
  { id: "office",   label: "Офис",      icon: "💼" },
];

export function ConfiguratorPanel() {
  const {
    category, setCategory,
    templates, selectedTemplate, setTemplate,
    selectedColor, setColor,
    selectedHandle, setHandle,
    totalPrice,
  } = useConfiguratorStore();

  return (
    <aside className="flex flex-col w-72 shrink-0 border-r border-slate-100 bg-white overflow-y-auto">
      <div className="p-5 space-y-7">

        {/* Step 1: Category */}
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
            1. Категория
          </p>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={cn(
                  "flex items-center gap-2 p-2.5 rounded-xl border text-sm font-medium transition-colors duration-150",
                  category === cat.id
                    ? "bg-slate-900 text-white border-slate-900"
                    : "border-slate-200 text-slate-600 hover:border-slate-400"
                )}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Template */}
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
            2. Шаблон
          </p>
          <div className="space-y-2">
            {templates.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => setTemplate(tpl)}
                className={cn(
                  "w-full p-3 rounded-xl border text-sm text-left transition-colors duration-150",
                  selectedTemplate.id === tpl.id
                    ? "bg-slate-900 text-white border-slate-900"
                    : "border-slate-200 text-slate-600 hover:border-slate-400"
                )}
              >
                {tpl.label}
              </button>
            ))}
          </div>
        </div>

        {/* Step 3: Color */}
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            3. Цвет фасада
          </p>
          <p className="text-xs text-slate-400 mb-3">{selectedColor.label}</p>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((color) => (
              <button
                key={color.id}
                onClick={() => setColor(color)}
                title={color.label}
                className={cn(
                  "w-9 h-9 rounded-xl border-2 transition-all duration-150",
                  selectedColor.id === color.id
                    ? "border-slate-900 ring-2 ring-slate-900 ring-offset-2 scale-110"
                    : "border-slate-200 hover:border-slate-400"
                )}
                style={{ backgroundColor: color.hex }}
              />
            ))}
          </div>
        </div>

        {/* Step 4: Handles */}
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
            4. Ручки / фурнитура
          </p>
          <div className="space-y-2">
            {HANDLES.map((handle) => (
              <button
                key={handle.id}
                onClick={() => setHandle(handle)}
                className={cn(
                  "w-full p-3 rounded-xl border text-sm text-left flex items-center justify-between transition-colors duration-150",
                  selectedHandle.id === handle.id
                    ? "bg-slate-900 text-white border-slate-900"
                    : "border-slate-200 text-slate-600 hover:border-slate-400"
                )}
              >
                <span>{handle.label}</span>
                {handle.priceAdd > 0 && (
                  <span className={cn(
                    "text-xs font-medium",
                    selectedHandle.id === handle.id ? "text-slate-300" : "text-slate-400"
                  )}>
                    +{handle.priceAdd.toLocaleString("ru")} ₸
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Price summary */}
      <div className="mt-auto border-t border-slate-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-slate-500">Итоговая стоимость</span>
          <span className="text-xl font-black text-slate-900">
            {totalPrice.toLocaleString("ru")} ₸
          </span>
        </div>
        <button className="w-full py-3 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors">
          Оставить заявку
        </button>
        <button className="w-full mt-2 py-2.5 border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors">
          Сохранить дизайн
        </button>
      </div>
    </aside>
  );
}
