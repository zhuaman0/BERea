"use client";

import { create } from "zustand";

export type FurnitureCategory = "kitchen" | "living" | "bedroom" | "hallway" | "office";

export interface ConfiguratorTemplate {
  id: string;
  label: string;
  bottomDoors: number;
  topDoors: number;
  hasIsland: boolean;
}

export interface MaterialColor {
  id: string;
  label: string;
  hex: string;
}

export interface HandleStyle {
  id: string;
  label: string;
  priceAdd: number;
}

const TEMPLATES: Record<FurnitureCategory, ConfiguratorTemplate[]> = {
  kitchen: [
    { id: "k1", label: "4 снизу + 2 сверху",  bottomDoors: 4, topDoors: 2, hasIsland: false },
    { id: "k2", label: "6 снизу + 3 сверху",  bottomDoors: 6, topDoors: 3, hasIsland: false },
    { id: "k3", label: "Угловой (L-форма)",    bottomDoors: 8, topDoors: 4, hasIsland: false },
    { id: "k4", label: "С островом",           bottomDoors: 6, topDoors: 3, hasIsland: true  },
  ],
  living: [
    { id: "l1", label: "Стенка 2м",   bottomDoors: 2, topDoors: 3, hasIsland: false },
    { id: "l2", label: "Стенка 3м",   bottomDoors: 4, topDoors: 4, hasIsland: false },
    { id: "l3", label: "Горка",       bottomDoors: 2, topDoors: 5, hasIsland: false },
  ],
  bedroom: [
    { id: "b1", label: "Шкаф 2 двери",  bottomDoors: 0, topDoors: 2, hasIsland: false },
    { id: "b2", label: "Шкаф 3 двери",  bottomDoors: 0, topDoors: 3, hasIsland: false },
    { id: "b3", label: "Шкаф-купе 4д",  bottomDoors: 0, topDoors: 4, hasIsland: false },
  ],
  hallway: [
    { id: "h1", label: "Прихожая стандарт", bottomDoors: 2, topDoors: 1, hasIsland: false },
    { id: "h2", label: "Прихожая угловая",  bottomDoors: 3, topDoors: 2, hasIsland: false },
  ],
  office: [
    { id: "o1", label: "Стеллаж открытый",  bottomDoors: 0, topDoors: 0, hasIsland: false },
    { id: "o2", label: "Шкаф + стеллаж",    bottomDoors: 2, topDoors: 3, hasIsland: false },
  ],
};

export const COLORS: MaterialColor[] = [
  { id: "white",  label: "Белый глянец",   hex: "#FFFFFF" },
  { id: "cream",  label: "Кремовый",       hex: "#F5F0E8" },
  { id: "grey",   label: "Серый мат",      hex: "#94A3B8" },
  { id: "black",  label: "Чёрный мат",     hex: "#1E293B" },
  { id: "oak",    label: "Дуб натуральный", hex: "#C49A6C" },
  { id: "walnut", label: "Орех",           hex: "#6B3F2A" },
  { id: "blue",   label: "Синий мат",      hex: "#2D5F8A" },
  { id: "green",  label: "Зелёный",        hex: "#4A7C59" },
];

export const HANDLES: HandleStyle[] = [
  { id: "chrome",  label: "Хром матовый",         priceAdd: 0     },
  { id: "gold",    label: "Золото",                priceAdd: 5000  },
  { id: "black",   label: "Чёрный мат",            priceAdd: 3000  },
  { id: "push",    label: "Push-to-open (без ручек)", priceAdd: 8000 },
];

const BASE_PRICE_PER_DOOR = 15000;
const BASE_PRICE = 85000;

interface ConfiguratorState {
  category: FurnitureCategory;
  templates: ConfiguratorTemplate[];
  selectedTemplate: ConfiguratorTemplate;
  selectedColor: MaterialColor;
  selectedHandle: HandleStyle;
  totalPrice: number;

  setCategory: (cat: FurnitureCategory) => void;
  setTemplate: (tpl: ConfiguratorTemplate) => void;
  setColor: (color: MaterialColor) => void;
  setHandle: (handle: HandleStyle) => void;
}

function calcPrice(template: ConfiguratorTemplate, handle: HandleStyle): number {
  const doors = template.bottomDoors + template.topDoors;
  return BASE_PRICE + doors * BASE_PRICE_PER_DOOR + handle.priceAdd + (template.hasIsland ? 50000 : 0);
}

export const useConfiguratorStore = create<ConfiguratorState>((set, get) => ({
  category: "kitchen",
  templates: TEMPLATES.kitchen,
  selectedTemplate: TEMPLATES.kitchen[0],
  selectedColor: COLORS[0],
  selectedHandle: HANDLES[0],
  totalPrice: calcPrice(TEMPLATES.kitchen[0], HANDLES[0]),

  setCategory: (cat) => {
    const templates = TEMPLATES[cat];
    const selectedTemplate = templates[0];
    const { selectedHandle } = get();
    set({
      category: cat,
      templates,
      selectedTemplate,
      totalPrice: calcPrice(selectedTemplate, selectedHandle),
    });
  },

  setTemplate: (tpl) => {
    const { selectedHandle } = get();
    set({ selectedTemplate: tpl, totalPrice: calcPrice(tpl, selectedHandle) });
  },

  setColor: (color) => set({ selectedColor: color }),

  setHandle: (handle) => {
    const { selectedTemplate } = get();
    set({ selectedHandle: handle, totalPrice: calcPrice(selectedTemplate, handle) });
  },
}));
