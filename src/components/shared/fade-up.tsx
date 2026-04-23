"use client";

import { m } from "framer-motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

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
};

export function FadeUp({
  as = "div",
  trigger = "inView",
  delay,
  y: yOffset = 16,
  amount = 0.2,
  margin,
  spring = "default",
  className,
  children,
}: FadeUpPropsT) {
  const reducedMotion = useReducedMotion();

  // When reduced, render a plain HTML tag. Going through <m.*> with no
  // animation props leaves framer-motion stuck at whatever motion values
  // it was holding — if the element was mid-animation from hidden=opacity:0
  // when the user flipped the toggle, it stays invisible. Bypassing the
  // motion component guarantees the element renders at its natural DOM
  // state (opacity: 1, no transform).
  if (reducedMotion) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

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
    >
      {children}
    </Component>
  );
}
