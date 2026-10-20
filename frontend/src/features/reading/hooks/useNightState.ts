"use client";

import { useEffect, useState } from "react";
import type { NightState } from "@berea/api";
import { usePolling } from "@berea/core";

const POLL_MS = 1000;
// Ask again just after a timed phase should have ended, so every screen flips together.
const PHASE_END_SLACK_MS = 60;

export function useNightState(load: () => Promise<NightState>) {
  const { data, error, setData } = usePolling(load, POLL_MS);

  useEffect(() => {
    if (!data || data.phase_time_left_ms <= 0) return;
    const id = window.setTimeout(() => {
      load().then(setData).catch(() => { /* the regular poll retries */ });
    }, data.phase_time_left_ms + PHASE_END_SLACK_MS);
    return () => window.clearTimeout(id);
  }, [data, load, setData]);

  return { state: data, error, setState: setData };
}

const TICK_MS = 100;

/** Milliseconds left, counted down locally and re-synced whenever the server sends a new value. */
export function useCountdownMs(timeLeftMs: number, syncKey: string): number {
  const [deadline, setDeadline] = useState<number | null>(null);
  const [now, setNow] = useState(0);

  useEffect(() => {
    const id = window.setTimeout(() => {
      const current = Date.now();
      setNow(current);
      setDeadline(current + timeLeftMs);
    }, 0);
    return () => window.clearTimeout(id);
  }, [timeLeftMs, syncKey]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), TICK_MS);
    return () => window.clearInterval(id);
  }, []);

  return deadline === null ? timeLeftMs : Math.max(0, deadline - now);
}
