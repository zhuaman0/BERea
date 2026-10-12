import { Circle, Diamond, Square, Triangle, type LucideIcon } from "lucide-react";

export const ANSWER_TILES: { bg: string; ring: string; icon: LucideIcon }[] = [
  { bg: "bg-red-500",    ring: "ring-red-300",    icon: Triangle },
  { bg: "bg-blue-500",   ring: "ring-blue-300",   icon: Diamond },
  { bg: "bg-yellow-500", ring: "ring-yellow-200", icon: Circle },
  { bg: "bg-green-500",  ring: "ring-green-300",  icon: Square },
];
