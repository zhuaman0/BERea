"use client";

import { useEffect, useState } from "react";

/** Polls `load` every `intervalMs` while mounted; the latest successful result wins. Pass a stable
 * (memoised) `load`, or polling restarts on every render. */
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
 * Whole seconds left, counted down locally between server updates. Resyncs whenever `timeLeftMs`
 * or `syncKey` changes, so the server stays the source of truth.
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
