"use client";

import { useEffect } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

interface AnimatedNumberProps {
  value:      number;
  className?: string;
}

/** Springs from its previous value (0 on mount) to `value`, so changing numbers visibly count. */
export function AnimatedNumber({ value, className }: AnimatedNumberProps) {
  const spring = useSpring(0, { stiffness: 140, damping: 22 });
  const display = useTransform(spring, (v) => Math.round(v));

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span className={className}>{display}</motion.span>;
}
