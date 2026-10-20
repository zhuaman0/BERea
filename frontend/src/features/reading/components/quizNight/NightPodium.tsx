"use client";

import { motion } from "framer-motion";
import { Crown } from "lucide-react";
import { useTranslations } from "next-intl";
import type { NightTeamScore } from "@berea/api";
import { cn } from "@/shared/lib/utils";

// Classic podium order: 2nd, 1st, 3rd; blocks rise 3rd → 2nd → 1st (A15).
const PODIUM = [
  { place: 2, height: "h-32 sm:h-44", rise: 0.15, color: "bg-[var(--rd-round-1)]" },
  { place: 1, height: "h-44 sm:h-60", rise: 0.3, color: "bg-[var(--rd-round-2)]" },
  { place: 3, height: "h-24 sm:h-32", rise: 0, color: "bg-[var(--rd-round-3)]" },
] as const;

const EMBER_COUNT = 5;

interface NightPodiumProps {
  teamScores:   NightTeamScore[];
  yourTeamName: string | null;
}

export function NightPodium({ teamScores, yourTeamName }: NightPodiumProps) {
  const t = useTranslations("reading.night.podium");
  const yourPlace = yourTeamName ? teamScores.findIndex((s) => s.team_name === yourTeamName) + 1 : 0;

  return (
    <motion.div key="finished" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative flex w-full max-w-4xl flex-col items-center">
      <h1 className="font-display text-center text-4xl font-bold text-white sm:text-6xl">{t("title")}</h1>
      {yourPlace > 0 && (
        <p className="mt-3 text-[var(--rd-text-muted)]">
          {t("yourPlace", { place: yourPlace, points: teamScores[yourPlace - 1].score })}
        </p>
      )}
      <div className="relative mt-12 flex w-full items-end justify-center gap-3 sm:gap-6">
        {Array.from({ length: EMBER_COUNT }, (_, i) => (
          <span key={i} aria-hidden="true" className="rd-ember rd-podium-ember" />
        ))}
        {PODIUM.map(({ place, height, rise, color }) => {
          const score = teamScores[place - 1];
          if (!score) return <div key={place} className="flex-1" />;
          return (
            <div key={place} className="flex max-w-56 flex-1 flex-col items-center">
              {place === 1 && <Crown size={34} className="mb-2 text-[var(--rd-round-1)]" aria-hidden="true" />}
              <p className="font-display truncate text-center text-base font-semibold text-white sm:text-xl">{score.team_name}</p>
              <p className="font-display text-sm text-[var(--rd-text-muted)] sm:text-lg">{t("points", { count: score.score })}</p>
              <motion.div
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: rise, type: "spring", stiffness: 200, damping: 22 }}
                className={cn("mt-3 flex w-full items-start justify-center rounded-t-2xl pt-3", height, color)}
              >
                <span className="font-display text-4xl font-bold text-white sm:text-6xl">{place}</span>
              </motion.div>
            </div>
          );
        })}
      </div>
      {teamScores.length > 3 && (
        <ol className="mt-8 w-full max-w-md space-y-1.5 text-sm" start={4}>
          {teamScores.slice(3).map((score, i) => (
            <li key={score.team_name} className="flex justify-between rounded-lg bg-[var(--rd-panel)] px-4 py-2 text-[var(--rd-text-muted)]">
              <span>{i + 4}. {score.team_name}</span>
              <span className="tabular-nums">{score.score}</span>
            </li>
          ))}
        </ol>
      )}
    </motion.div>
  );
}
