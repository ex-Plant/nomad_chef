"use client";

import { motion } from "framer-motion";
import type { ComponentPropsWithoutRef } from "react";

const FADE_UP = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
} as const;

const DEFAULT_EASE = [0.32, 0.72, 0, 1] as const;

type FadeUpPropsT = {
  readonly as?: "div" | "h2" | "p" | "section";
  readonly duration?: number;
  readonly delay?: number;
  readonly amount?: number;
  readonly margin?: string;
  readonly className?: string;
  readonly children: React.ReactNode;
} & Omit<ComponentPropsWithoutRef<typeof motion.div>, "variants" | "initial" | "whileInView" | "viewport" | "transition">;

export function FadeUp({
  as = "div",
  duration = 0.8,
  delay,
  amount = 0.3,
  margin,
  className,
  children,
  ...rest
}: FadeUpPropsT) {
  const Component = motion[as];

  const transition = {
    duration,
    ease: DEFAULT_EASE,
    ...(delay !== undefined && { delay }),
  };

  const viewport = {
    once: true,
    ...(margin ? { margin } : { amount }),
  };

  return (
    <Component
      variants={FADE_UP}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      transition={transition}
      className={className}
      {...rest}
    >
      {children}
    </Component>
  );
}
