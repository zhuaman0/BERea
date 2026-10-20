"use client";

import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { useTranslations } from "next-intl";
import type { NightState } from "@berea/api";
import { NIGHT_EASE } from "./roundTheme";

interface NightLobbyProps {
  state:    NightState;
  isHost:   boolean;
  /** Absolute link a phone opens to join; host only. */
  joinUrl?: string;
}

/** Host: QR + PIN to join, and the teams already in. Player: "you're in". */
export function NightLobby({ state, isHost, joinUrl }: NightLobbyProps) {
  const t = useTranslations("reading.night.lobby");
  const teams = state.team_scores.map((score) => score.team_name);

  if (!isHost) {
    return (
      <motion.div
        key="lobby"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: NIGHT_EASE }}
        className="flex flex-col items-center text-center"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--rd-accent-from)]">{state.quiz_title}</p>
        <h1 className="font-display mt-4 text-4xl font-bold text-white sm:text-5xl">{t("youreIn")}</h1>
        <p className="mt-3 text-[var(--rd-text-muted)]">
          {state.your_team_name ? t("playingFor", { team: state.your_team_name }) : t("noTeam")}
        </p>
        <p className="mt-8 text-sm text-[var(--rd-text-muted)]">{t("waiting")}</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      key="lobby"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[auto_1fr]"
    >
      {joinUrl && (
        <div className="mx-auto rounded-3xl border-4 border-[var(--rd-round-3)] bg-white p-5">
          <QRCodeSVG value={joinUrl} size={260} marginSize={0} title={t("qrLabel")} />
        </div>
      )}
      <div className="text-center lg:text-left">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--rd-accent-from)]">{state.quiz_title}</p>
        <h1 className="font-display mt-3 text-4xl font-bold text-white sm:text-6xl">{t("joinTitle")}</h1>
        <p className="mt-4 text-[var(--rd-text-muted)]">{t("joinHint")}</p>
        <p className="font-display mt-6 text-6xl font-bold tracking-[0.25em] text-white sm:text-8xl">{state.pin}</p>
        <p className="mt-8 text-sm font-semibold text-[var(--rd-text)]">{t("teamsJoined", { count: state.teams_joined })}</p>
        <ul className="mt-3 flex flex-wrap justify-center gap-2 lg:justify-start">
          {teams.map((team, i) => (
            <motion.li
              key={team}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-full border border-[var(--rd-border)] bg-[var(--rd-panel)] px-3 py-1 text-sm text-[var(--rd-text)]"
            >
              {team}
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
