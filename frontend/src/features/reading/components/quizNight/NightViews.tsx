"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import type { NightQuestion, NightReveal } from "@berea/api";
import { AnimatedNumber } from "@berea/ui-kit";
import { BookExcerpt } from "./BookExcerpt";
import { CountdownRing } from "./CountdownRing";
import { NightShape } from "./NightShape";
import { NIGHT_EASE, NIGHT_SPRING, romanRound } from "./roundTheme";

const BANNER_LETTER_STAGGER_S = 0.04;

export function questionLayoutId(roundNumber: number, questionNumber: number): string {
  return `q-${roundNumber}-${questionNumber}`;
}

interface RoundCardProps {
  roundNumber: number;
}

/** The board's round pill grown into a big square (A4). */
export function RoundCard({ roundNumber }: RoundCardProps) {
  const t = useTranslations("reading.night");
  return (
    <NightShape
      layoutId={`round-${roundNumber}`}
      roundNumber={roundNumber}
      filled
      initialFilled
      radius={32}
      className="size-[min(78vw,30rem)] sm:size-[min(56vh,30rem)]"
    >
      <span className="font-display px-6 text-center text-[clamp(2.5rem,9vw,6rem)] font-bold leading-none text-white">
        {t("roundLabel", { roman: romanRound(roundNumber) })}
      </span>
    </NightShape>
  );
}

interface NumberCardProps {
  roundNumber:    number;
  questionNumber: number;
}

/** A filled square with the question number; it morphs into the question frame (A6, A7, A10). */
export function NumberCard({ roundNumber, questionNumber }: NumberCardProps) {
  return (
    <NightShape
      layoutId={questionLayoutId(roundNumber, questionNumber)}
      roundNumber={roundNumber}
      filled
      radius={28}
      className="size-[min(62vw,24rem)] sm:size-[min(48vh,24rem)]"
    >
      <motion.span
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3, ease: NIGHT_EASE }}
        className="font-display text-[clamp(6rem,30vw,14rem)] font-bold leading-none text-white"
      >
        {questionNumber}
      </motion.span>
    </NightShape>
  );
}

interface QuestionFrameProps {
  roundNumber:    number;
  questionNumber: number;
  question:       NightQuestion;
  /** Shown during the question phase; the review shows the question without a timer. */
  timer:          { timeLeftMs: number; syncKey: string } | null;
  reveal:         NightReveal | null;
  showTeamCount:  boolean;
}

/** The outlined frame that holds a question, and later its answer (A7, A8, A12, A13). */
export function QuestionFrame({ roundNumber, questionNumber, question, timer, reveal, showTeamCount }: QuestionFrameProps) {
  const t = useTranslations("reading.night");
  return (
    <NightShape
      layoutId={questionLayoutId(roundNumber, questionNumber)}
      roundNumber={roundNumber}
      filled={false}
      radius={36}
      className="min-h-[18rem] w-full max-w-6xl sm:aspect-video sm:min-h-0"
    >
      {timer && (
        <CountdownRing
          timeLeftMs={timer.timeLeftMs}
          syncKey={timer.syncKey}
          totalMs={question.time_limit_seconds * 1000}
          roundNumber={roundNumber}
          className="absolute right-5 top-5 w-16 sm:right-10 sm:top-10 sm:w-[clamp(5rem,12vw,10rem)]"
        />
      )}
      <AnimatePresence mode="wait" initial={false}>
        {reveal ? (
          <motion.div
            key="answer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex w-full flex-col items-center gap-5 px-6 py-12 sm:gap-8 sm:px-16"
          >
            <motion.h2
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={NIGHT_SPRING}
              className="font-display text-center text-[clamp(1.8rem,4.6vw,4.25rem)] font-bold leading-tight text-white"
            >
              {reveal.correct_text}
            </motion.h2>
            {reveal.quote && (
              <motion.div
                initial={{ opacity: 0, y: 30, rotate: -1 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                transition={{ duration: 0.45, delay: 0.25, ease: NIGHT_EASE }}
                className="w-full max-w-4xl"
              >
                <BookExcerpt quote={reveal.quote} sourceRef={reveal.source_ref} />
              </motion.div>
            )}
            {showTeamCount && (
              <p className="text-sm text-[var(--rd-text-muted)] sm:text-lg">
                {t.rich("review.teamsGotIt", {
                  count: reveal.correct_team_count,
                  num: () => <AnimatedNumber value={reveal.correct_team_count} className="font-display font-bold text-white" />,
                })}
              </p>
            )}
          </motion.div>
        ) : (
          <motion.p
            key="question"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.25, duration: 0.35, ease: NIGHT_EASE }}
            className="font-display max-w-5xl px-6 pb-10 pt-24 text-center text-[clamp(1.4rem,3.8vw,3.75rem)] font-bold leading-tight text-white sm:px-20 sm:py-16"
          >
            {question.text}
          </motion.p>
        )}
      </AnimatePresence>
    </NightShape>
  );
}

interface AnswersBannerProps {
  roundNumber:        number;
  lastQuestionNumber: number;
}

/** Number card of the round's last question stretched sideways into the "ANSWERS" banner (A11). */
export function AnswersBanner({ roundNumber, lastQuestionNumber }: AnswersBannerProps) {
  const t = useTranslations("reading.night");
  const word = t("answersBanner");
  return (
    <NightShape
      layoutId={questionLayoutId(roundNumber, lastQuestionNumber)}
      roundNumber={roundNumber}
      filled
      initialFilled
      radius={32}
      className="h-[min(34vw,18rem)] w-[min(92vw,68rem)]"
    >
      <span className="font-display flex text-[clamp(2.5rem,10vw,8.5rem)] font-bold leading-none tracking-tight text-white" aria-label={word}>
        {Array.from(word).map((letter, i) => (
          <motion.span
            key={i}
            aria-hidden="true"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * BANNER_LETTER_STAGGER_S, duration: 0.3, ease: NIGHT_EASE }}
          >
            {letter}
          </motion.span>
        ))}
      </span>
    </NightShape>
  );
}
