import { Crown, Feather, Flame, Moon, Star, Type, type LucideIcon } from "lucide-react";
import type { CoverAnimation, CoverColor, CoverEmblem, CoverPattern } from "@/features/reading/authTypes";

interface CoverInk {
  fill:    string;
  text:    string;
  stroke:  string;
  overlay: string;
}

const DARK_INK: CoverInk = { fill: "fill-black/80", text: "text-black/75", stroke: "stroke-black/25", overlay: "stroke-black/10 fill-black/10" };
const LIGHT_INK: CoverInk = { fill: "fill-white/95", text: "text-white/90", stroke: "stroke-white/30", overlay: "stroke-white/15 fill-white/15" };
const GOLD_INK: CoverInk = { fill: "fill-amber-300", text: "text-amber-300", stroke: "stroke-amber-300/40", overlay: "stroke-amber-200/10 fill-amber-200/10" };

export interface CoverColorPreset {
  label:  string;
  from:   string;
  to:     string;
  spine:  string;
  swatch: string;
  glow:   string;
  ink:    CoverInk;
}

// Full class strings (never built by concatenation) so Tailwind's scanner can see every one.
export const COVER_COLORS: Record<CoverColor, CoverColorPreset> = {
  ember:     { label: "Ember",     from: "[stop-color:#ff6b2c]", to: "[stop-color:#ffc24d]", spine: "fill-[#c2410c]", swatch: "bg-gradient-to-br from-[#ff6b2c] to-[#ffc24d]", glow: "255, 140, 60", ink: DARK_INK },
  crimson:   { label: "Crimson",   from: "[stop-color:#7f1d1d]", to: "[stop-color:#dc2626]", spine: "fill-[#450a0a]", swatch: "bg-gradient-to-br from-[#7f1d1d] to-[#dc2626]", glow: "239, 68, 68", ink: LIGHT_INK },
  ocean:     { label: "Ocean",     from: "[stop-color:#0c4a6e]", to: "[stop-color:#0ea5e9]", spine: "fill-[#082f49]", swatch: "bg-gradient-to-br from-[#0c4a6e] to-[#0ea5e9]", glow: "56, 189, 248", ink: LIGHT_INK },
  forest:    { label: "Forest",    from: "[stop-color:#14532d]", to: "[stop-color:#16a34a]", spine: "fill-[#052e16]", swatch: "bg-gradient-to-br from-[#14532d] to-[#16a34a]", glow: "74, 222, 128", ink: LIGHT_INK },
  plum:      { label: "Plum",      from: "[stop-color:#3b0764]", to: "[stop-color:#7e22ce]", spine: "fill-[#2e1065]", swatch: "bg-gradient-to-br from-[#3b0764] to-[#7e22ce]", glow: "192, 132, 252", ink: LIGHT_INK },
  midnight:  { label: "Midnight",  from: "[stop-color:#020617]", to: "[stop-color:#334155]", spine: "fill-[#000000]", swatch: "bg-gradient-to-br from-[#020617] to-[#334155]", glow: "252, 211, 77", ink: GOLD_INK },
  parchment: { label: "Parchment", from: "[stop-color:#d6c4a1]", to: "[stop-color:#f6eedd]", spine: "fill-[#8a7552]", swatch: "bg-gradient-to-br from-[#d6c4a1] to-[#f6eedd]", glow: "246, 238, 221", ink: DARK_INK },
};

export const COVER_PATTERNS: Record<CoverPattern, string> = {
  plain:   "Plain",
  stripes: "Stripes",
  dots:    "Dots",
  lines:   "Lines",
};

export const COVER_EMBLEMS: Record<CoverEmblem, { label: string; icon: LucideIcon }> = {
  monogram: { label: "Initials", icon: Type },
  flame:    { label: "Flame",    icon: Flame },
  star:     { label: "Star",     icon: Star },
  feather:  { label: "Feather",  icon: Feather },
  crown:    { label: "Crown",    icon: Crown },
  moon:     { label: "Moon",     icon: Moon },
};

export const COVER_ANIMATIONS: Record<CoverAnimation, { label: string; hint: string }> = {
  float: { label: "Float", hint: "Gently drifts" },
  glow:  { label: "Glow",  hint: "Pulses with light" },
  still: { label: "Still", hint: "No motion" },
};

export const COVER_TITLE_MAX = 24;
