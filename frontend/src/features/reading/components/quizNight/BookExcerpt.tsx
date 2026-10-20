"use client";

import { Fragment, type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/shared/lib/utils";

const HIGHLIGHT_DELAY_S = 0.7;

/** `*italic*` → <em>. Unpaired asterisks stay as typed. */
function renderItalics(text: string, keyPrefix: string): ReactNode[] {
  const parts = text.split("*");
  if (parts.length % 2 === 0) return [text];
  return parts.map((part, i) =>
    i % 2 === 1 ? <em key={`${keyPrefix}-${i}`}>{part}</em> : <Fragment key={`${keyPrefix}-${i}`}>{part}</Fragment>,
  );
}

interface BookExcerptProps {
  /** The passage, with `*italic*` and `==highlight==` markup. */
  quote:      string;
  sourceRef?: string | null;
  /** Sweep the highlighter in (the projector reveal); off in the admin preview. */
  animate?:   boolean;
  /** "stage" scales with the projector; "preview" is the admin builder's fixed small size. */
  size?:      "stage" | "preview";
  className?: string;
}

/** The answer's proof, styled as a clipping from the printed book. */
export function BookExcerpt({ quote, sourceRef, animate = true, size = "stage", className }: BookExcerptProps) {
  const segments = quote.split("==");
  // An unpaired `==` is shown as typed rather than highlighting the rest of the passage.
  const balanced = segments.length % 2 === 1;

  return (
    <figure className={cn("rounded-sm bg-white px-5 py-4 text-black shadow-[0_18px_50px_rgba(0,0,0,0.45)] sm:px-7 sm:py-5", className)}>
      <blockquote className={cn("font-serif leading-snug", size === "stage" ? "text-[clamp(1rem,2.2vw,1.9rem)]" : "text-lg")}>
        {balanced
          ? segments.map((segment, i) =>
              i % 2 === 1 ? (
                <motion.mark
                  key={i}
                  className="rd-highlighter"
                  initial={animate ? { backgroundSize: "0% 100%" } : false}
                  animate={{ backgroundSize: "100% 100%" }}
                  transition={{ duration: 0.6, delay: animate ? HIGHLIGHT_DELAY_S : 0, ease: "easeOut" }}
                >
                  {renderItalics(segment, `h${i}`)}
                </motion.mark>
              ) : (
                <Fragment key={i}>{renderItalics(segment, `t${i}`)}</Fragment>
              ),
            )
          : renderItalics(quote, "t")}
      </blockquote>
      {sourceRef && <figcaption className="mt-2 text-right font-serif text-sm italic text-black/55">{sourceRef}</figcaption>}
    </figure>
  );
}
