"use client";

import { m } from "framer-motion";
import type { ComponentPropsWithoutRef } from "react";

const SPRING_PRESETS = {
  /** Gentle, editorial — slow settle, zero overshoot */
  gentle: { stiffness: 60, damping: 18, mass: 1 },
  /** Default — balanced, ~0.8s settle */
  default: { stiffness: 120, damping: 22, mass: 1 },
  /** Snappy — arrives quickly, still no overshoot */
  snappy: { stiffness: 220, damping: 28, mass: 1 },
  /** Bouncy — visible overshoot, playful */
  bouncy: { stiffness: 180, damping: 12, mass: 1 },
  /** Slow and heavy — cinematic */
  heavy: { stiffness: 40, damping: 16, mass: 1.5 },
} as const;

type SpringKeyT = keyof typeof SPRING_PRESETS;

type FadeUpPropsT = {
  as?: "div" | "h1" | "h2" | "p" | "section";
  trigger?: "inView" | "mount";
  delay?: number;
  y?: number;
  amount?: number;
  margin?: string;
  spring?: SpringKeyT;
  className?: string;
  children?: React.ReactNode;
} & Omit<
  ComponentPropsWithoutRef<typeof m.div>,
  "variants" | "initial" | "whileInView" | "animate" | "viewport" | "transition"
>;

export function FadeUp({
  as = "div",
  trigger = "inView",
  delay,
  y: yOffset = 16,
  amount = 0.3,
  margin,
  spring = "default",
  className,
  children,
  ...rest
}: FadeUpPropsT) {
  const Component = m[as];

  const hidden = { opacity: 0, y: yOffset };
  const visible = { opacity: 1, y: 0 };

  const transition = {
    type: "spring" as const,
    ...SPRING_PRESETS[spring],
    ...(delay !== undefined && { delay }),
  };

  const viewport = {
    once: true,
    ...(margin ? { margin } : { amount }),
  };

  const motionProps =
    trigger === "mount"
      ? { initial: hidden, animate: visible, exit: hidden }
      : { initial: hidden, whileInView: visible, viewport, exit: hidden };

  return (
    <Component
      {...motionProps}
      transition={transition}
      className={className}
      {...rest}
    >
      {children}
    </Component>
  );
}
