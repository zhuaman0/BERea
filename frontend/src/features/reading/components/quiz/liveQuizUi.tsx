"use client";

import { useEffect, useState } from "react";
import { Circle, Diamond, Square, Triangle, type LucideIcon } from "lucide-react";

export const ANSWER_TILES: { bg: string; ring: string; icon: LucideIcon }[] = [
  { bg: "bg-red-500",    ring: "ring-red-300",    icon: Triangle },
  { bg: "bg-blue-500",   ring: "ring-blue-300",   icon: Diamond },
  { bg: "bg-yellow-500", ring: "ring-yellow-200", icon: Circle },
  { bg: "bg-green-500",  ring: "ring-green-300",  icon: Square },
];

/** Polls `load` every `intervalMs` while mounted; the latest successful result wins. */
export function usePolling<T>(
  load: () => Promise<T>,
  intervalMs: number
): { data: T | null; error: unknown; setData: (data: T) => void } {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let cancelled = false;
    const tick = () =>
      load()
        .then((result) => { if (!cancelled) { setData(result); setError(null); } })
        .catch((err: unknown) => { if (!cancelled) setError(err); });
    tick();
    const id = window.setInterval(tick, intervalMs);
    return () => { cancelled = true; window.clearInterval(id); };
  }, [load, intervalMs]);

  return { data, error, setData };
}

/**
 * Counts down locally between polls from the server's `time_left_ms`, so the timer
 * moves smoothly while the server stays the source of truth.
 */
export function useCountdownSeconds(timeLeftMs: number | undefined, syncKey: unknown): number {
  const [deadline, setDeadline] = useState<number | null>(null);
  const [now, setNow] = useState(0);

  useEffect(() => {
    const id = window.setTimeout(() => {
      const current = Date.now();
      setNow(current);
      setDeadline(timeLeftMs === undefined ? null : current + timeLeftMs);
    }, 0);
    return () => window.clearTimeout(id);
  }, [timeLeftMs, syncKey]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 200);
    return () => window.clearInterval(id);
  }, []);

  if (deadline === null) return 0;
  return Math.max(0, Math.ceil((deadline - now) / 1000));
}
