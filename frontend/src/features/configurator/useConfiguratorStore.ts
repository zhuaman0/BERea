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

export interface DoorStyle {
  id: string;
  label: string;
  sub: string;
  bg: string;
  priceAdd: number;
}

const TEMPLATES: Record<FurnitureCategory, ConfiguratorTemplate[]> = {
  kitchen: [
    { id: "k1", label: "Мини",             bottomDoors: 2, topDoors: 2, hasIsland: false },
    { id: "k2", label: "Стандарт",         bottomDoors: 4, topDoors: 2, hasIsland: false },
    { id: "k3", label: "Расширенный",      bottomDoors: 6, topDoors: 3, hasIsland: false },
    { id: "k4", label: "Большой",          bottomDoors: 8, topDoors: 4, hasIsland: false },
    { id: "k5", label: "Угловой (L-форма)",bottomDoors: 6, topDoors: 3, hasIsland: false },
    { id: "k6", label: "С островом",       bottomDoors: 6, topDoors: 3, hasIsland: true  },
    { id: "k7", label: "Остров без верха", bottomDoors: 4, topDoors: 0, hasIsland: true  },
    { id: "k8", label: "Панорамный",       bottomDoors: 8, topDoors: 6, hasIsland: false },
  ],
  living: [
    { id: "l1", label: "TV-стойка",        bottomDoors: 2, topDoors: 0, hasIsland: false },
    { id: "l2", label: "Стенка 2м",        bottomDoors: 2, topDoors: 3, hasIsland: false },
    { id: "l3", label: "Стенка 3м",        bottomDoors: 4, topDoors: 4, hasIsland: false },
    { id: "l4", label: "Горка классика",   bottomDoors: 2, topDoors: 5, hasIsland: false },
    { id: "l5", label: "Горка с витриной", bottomDoors: 4, topDoors: 6, hasIsland: false },
    { id: "l6", label: "Комбинированная",  bottomDoors: 6, topDoors: 5, hasIsland: false },
  ],
  bedroom: [
    { id: "b1", label: "Шкаф 2 двери",    bottomDoors: 0, topDoors: 2, hasIsland: false },
    { id: "b2", label: "Шкаф 3 двери",    bottomDoors: 0, topDoors: 3, hasIsland: false },
    { id: "b3", label: "Шкаф-купе 4д",    bottomDoors: 0, topDoors: 4, hasIsland: false },
    { id: "b4", label: "Шкаф + комод",    bottomDoors: 2, topDoors: 3, hasIsland: false },
    { id: "b5", label: "Гардеробная 5д",  bottomDoors: 0, topDoors: 5, hasIsland: false },
    { id: "b6", label: "С островом",      bottomDoors: 2, topDoors: 4, hasIsland: true  },
  ],
  hallway: [
    { id: "h1", label: "Минимальный",     bottomDoors: 1, topDoors: 1, hasIsland: false },
    { id: "h2", label: "Стандарт",        bottomDoors: 2, topDoors: 1, hasIsland: false },
    { id: "h3", label: "С антресолью",    bottomDoors: 2, topDoors: 3, hasIsland: false },
    { id: "h4", label: "Угловая",         bottomDoors: 3, topDoors: 2, hasIsland: false },
    { id: "h5", label: "Расширенная",     bottomDoors: 4, topDoors: 3, hasIsland: false },
  ],
  office: [
    { id: "o1", label: "Стеллаж",         bottomDoors: 0, topDoors: 4, hasIsland: false },
    { id: "o2", label: "Шкаф закрытый",   bottomDoors: 2, topDoors: 2, hasIsland: false },
    { id: "o3", label: "Шкаф + стеллаж", bottomDoors: 2, topDoors: 4, hasIsland: false },
    { id: "o4", label: "Кабинет рук.",    bottomDoors: 4, topDoors: 4, hasIsland: false },
    { id: "o5", label: "Библиотека",      bottomDoors: 2, topDoors: 6, hasIsland: false },
  ],
};

export { TEMPLATES };

export const COLORS: MaterialColor[] = [
  { id: "white",  label: "Белый глянец",    hex: "#FFFFFF" },
  { id: "cream",  label: "Кремовый",        hex: "#F5F0E8" },
  { id: "grey",   label: "Серый мат",       hex: "#94A3B8" },
  { id: "black",  label: "Чёрный мат",      hex: "#1E293B" },
  { id: "oak",    label: "Дуб натуральный", hex: "#C49A6C" },
  { id: "walnut", label: "Орех",            hex: "#6B3F2A" },
  { id: "blue",   label: "Синий мат",       hex: "#2D5F8A" },
  { id: "green",  label: "Зелёный",         hex: "#4A7C59" },
];

export const DOOR_STYLES: DoorStyle[] = [
  { id: "laminate",  label: "Ламинат",   sub: "Дерево · Матовый",  bg: "linear-gradient(150deg,#c8a578 0%,#9e7348 55%,#c8a578 100%)", priceAdd: 0      },
  { id: "acrylic",   label: "Акрил",    sub: "Глянцевый",          bg: "linear-gradient(150deg,#f8f8f8 0%,#e4e4e4 50%,#f8f8f8 100%)", priceAdd: 8000  },
  { id: "mdf",       label: "МДФ Эмаль",sub: "Матовый",            bg: "linear-gradient(150deg,#eae6e0 0%,#d8d3cb 100%)",              priceAdd: 5000  },
  { id: "veneer",    label: "Шпон",     sub: "Натуральный",        bg: "linear-gradient(150deg,#8b5e3c 0%,#6b3f2a 55%,#8b5e3c 100%)", priceAdd: 15000 },
  { id: "glass",     label: "Стекло",   sub: "Прозрачный",         bg: "linear-gradient(150deg,#d0e8f0 0%,#a8cce0 50%,#d0e8f0 100%)", priceAdd: 12000 },
  { id: "paint",     label: "Краска",   sub: "Любой цвет",         bg: "linear-gradient(150deg,#e0d4ea 0%,#c8b4d8 50%,#e0d4ea 100%)", priceAdd: 6000  },
];

export const HANDLES: HandleStyle[] = [
  { id: "chrome", label: "Хром матовый",            priceAdd: 0     },
  { id: "gold",   label: "Золото",                  priceAdd: 5000  },
  { id: "black",  label: "Чёрный мат",              priceAdd: 3000  },
  { id: "push",   label: "Push-to-open (без ручек)", priceAdd: 8000 },
];

const BASE_PRICE_PER_DOOR = 15000;
const BASE_PRICE = 85000;

interface ConfiguratorState {
  category:         FurnitureCategory;
  templates:        ConfiguratorTemplate[];
  selectedTemplate: ConfiguratorTemplate;
  selectedColor:    MaterialColor;
  selectedDoorStyle:DoorStyle;
  selectedHandle:   HandleStyle;
  totalPrice:       number;

  isCustomMode:      boolean;
  customBottomDoors: number;
  customTopDoors:    number;
  customHasIsland:   boolean;

  setCategory:          (cat: FurnitureCategory) => void;
  setTemplate:          (tpl: ConfiguratorTemplate) => void;
  selectCustomMode:     () => void;
  setCustomBottomDoors: (n: number) => void;
  setCustomTopDoors:    (n: number) => void;
  setCustomHasIsland:   (v: boolean) => void;
  setColor:             (color: MaterialColor) => void;
  setDoorStyle:         (style: DoorStyle) => void;
  setHandle:            (handle: HandleStyle) => void;
  loadFromSaved:        (config: Record<string, unknown>) => void;
}

function calcPrice(
  template: ConfiguratorTemplate,
  handle: HandleStyle,
  doorStyle: DoorStyle,
): number {
  const doors = template.bottomDoors + template.topDoors;
  return (
    BASE_PRICE
    + doors * BASE_PRICE_PER_DOOR
    + handle.priceAdd
    + doorStyle.priceAdd
    + (template.hasIsland ? 50000 : 0)
  );
}

function buildCustomTemplate(bottom: number, top: number, island: boolean): ConfiguratorTemplate {
  return { id: "custom", label: "Свой шаблон", bottomDoors: bottom, topDoors: top, hasIsland: island };
}

export const useConfiguratorStore = create<ConfiguratorState>((set, get) => ({
  category:          "kitchen",
  templates:         TEMPLATES.kitchen,
  selectedTemplate:  TEMPLATES.kitchen[0],
  selectedColor:     COLORS[0],
  selectedDoorStyle: DOOR_STYLES[0],
  selectedHandle:    HANDLES[0],
  totalPrice:        calcPrice(TEMPLATES.kitchen[0], HANDLES[0], DOOR_STYLES[0]),

  isCustomMode:      false,
  customBottomDoors: 3,
  customTopDoors:    2,
  customHasIsland:   false,

  setCategory: (cat) => {
    const templates = TEMPLATES[cat];
    const selectedTemplate = templates[0];
    const { selectedHandle, selectedDoorStyle } = get();
    set({
      category: cat,
      templates,
      selectedTemplate,
      isCustomMode: false,
      totalPrice: calcPrice(selectedTemplate, selectedHandle, selectedDoorStyle),
    });
  },

  setTemplate: (tpl) => {
    const { selectedHandle, selectedDoorStyle } = get();
    set({
      selectedTemplate: tpl,
      isCustomMode: false,
      totalPrice: calcPrice(tpl, selectedHandle, selectedDoorStyle),
    });
  },

  selectCustomMode: () => {
    const { customBottomDoors, customTopDoors, customHasIsland, selectedHandle, selectedDoorStyle } = get();
    const tpl = buildCustomTemplate(customBottomDoors, customTopDoors, customHasIsland);
    set({ isCustomMode: true, selectedTemplate: tpl, totalPrice: calcPrice(tpl, selectedHandle, selectedDoorStyle) });
  },

  setCustomBottomDoors: (n) => {
    const { customTopDoors, customHasIsland, selectedHandle, selectedDoorStyle } = get();
    const tpl = buildCustomTemplate(n, customTopDoors, customHasIsland);
    set({ customBottomDoors: n, selectedTemplate: tpl, totalPrice: calcPrice(tpl, selectedHandle, selectedDoorStyle) });
  },

  setCustomTopDoors: (n) => {
    const { customBottomDoors, customHasIsland, selectedHandle, selectedDoorStyle } = get();
    const tpl = buildCustomTemplate(customBottomDoors, n, customHasIsland);
    set({ customTopDoors: n, selectedTemplate: tpl, totalPrice: calcPrice(tpl, selectedHandle, selectedDoorStyle) });
  },

  setCustomHasIsland: (v) => {
    const { customBottomDoors, customTopDoors, selectedHandle, selectedDoorStyle } = get();
    const tpl = buildCustomTemplate(customBottomDoors, customTopDoors, v);
    set({ customHasIsland: v, selectedTemplate: tpl, totalPrice: calcPrice(tpl, selectedHandle, selectedDoorStyle) });
  },

  setColor: (color) => set({ selectedColor: color }),

  setDoorStyle: (style) => {
    const { selectedTemplate, selectedHandle } = get();
    set({ selectedDoorStyle: style, totalPrice: calcPrice(selectedTemplate, selectedHandle, style) });
  },

  setHandle: (handle) => {
    const { selectedTemplate, selectedDoorStyle } = get();
    set({ selectedHandle: handle, totalPrice: calcPrice(selectedTemplate, handle, selectedDoorStyle) });
  },

  loadFromSaved: (config) => {
    const cat  = (config.category  as FurnitureCategory | undefined) ?? "kitchen";
    const tpl  = config.template   as ConfiguratorTemplate | undefined;
    const col  = config.color      as MaterialColor       | undefined;
    const door = config.doorStyle  as DoorStyle           | undefined;
    const hdl  = config.handle     as HandleStyle         | undefined;

    const templates        = TEMPLATES[cat] ?? TEMPLATES.kitchen;
    const selectedTemplate = tpl  ?? templates[0];
    const selectedColor    = col  ?? COLORS[0];
    const selectedDoorStyle= door ?? DOOR_STYLES[0];
    const selectedHandle   = hdl  ?? HANDLES[0];

    const isCustom = !templates.find(t => t.id === selectedTemplate.id);

    set({
      category: cat,
      templates,
      selectedTemplate,
      selectedColor,
      selectedDoorStyle,
      selectedHandle,
      isCustomMode:      isCustom,
      customBottomDoors: selectedTemplate.bottomDoors,
      customTopDoors:    selectedTemplate.topDoors,
      customHasIsland:   selectedTemplate.hasIsland,
      totalPrice:        calcPrice(selectedTemplate, selectedHandle, selectedDoorStyle),
    });
  },
}));
