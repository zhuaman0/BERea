"use client";

import { useCallback } from "react";
import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Radio } from "lucide-react";
import { readingLiveQuizApi } from "@/features/reading/liveQuizApi";
import { usePolling } from "./liveQuizUi";

const LIVE_CHECK_INTERVAL_MS = 5000;

/** Invites students into a running quiz from any page of the app. */
export function LiveQuizBanner() {
  const pathname = usePathname();
  const load = useCallback(() => readingLiveQuizApi.live(), []);
  const { data: live } = usePolling(load, LIVE_CHECK_INTERVAL_MS);
  const show = live && live.phase !== "finished" && pathname !== "/reading/quiz";

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden"
        >
          <Link
            href={`/reading/quiz?pin=${live.pin}` as Route}
            className="rd-accent-gradient flex items-center justify-center gap-3 px-4 py-2.5 text-sm font-semibold text-black/85"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-black/50" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-black/70" />
            </span>
            <Radio size={15} />
            Quiz night is live: {live.quiz_title} — tap to join
            <span className="rounded-full bg-black/15 px-2 py-0.5 font-mono tracking-widest">PIN {live.pin}</span>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
