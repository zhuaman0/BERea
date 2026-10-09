"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface Props {
  imageUrl: string;
  children: ReactNode;
}

export function ParallaxHero({ imageUrl, children }: Props) {
  const ref = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "38%"]);

  return (
    <section ref={ref} className="relative h-screen overflow-hidden">
      {/* background image — extended top/bottom so parallax never exposes empty space */}
      <motion.div
        style={{ y, top: "-18%", bottom: "-18%", left: 0, right: 0, position: "absolute" }}
        className="will-change-transform"
        aria-hidden="true"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url("${imageUrl}")` }}
        />
      </motion.div>

      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/15 to-black/60 pointer-events-none" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center text-white">
        {children}
      </div>
    </section>
  );
}
