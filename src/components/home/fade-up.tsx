"use client";

import { m } from "framer-motion";
import type { ComponentPropsWithoutRef } from "react";
import { EASE } from "@/components/home/animation-constants";

const FADE_UP = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
} as const;

type FadeUpPropsT = {
  readonly as?: "div" | "h1" | "h2" | "p" | "section";
  readonly trigger?: "inView" | "mount";
  readonly duration?: number;
  readonly delay?: number;
  readonly amount?: number;
  readonly margin?: string;
  readonly className?: string;
  readonly children?: React.ReactNode;
} & Omit<ComponentPropsWithoutRef<typeof m.div>, "variants" | "initial" | "whileInView" | "animate" | "viewport" | "transition">;

export function FadeUp({
  as = "div",
  trigger = "inView",
  duration = 0.8,
  delay,
  amount = 0.3,
  margin,
  className,
  children,
  ...rest
}: FadeUpPropsT) {
  const Component = m[as];

  const transition = {
    duration,
    ease: EASE,
    ...(delay !== undefined && { delay }),
  };

  const viewport = {
    once: true,
    ...(margin ? { margin } : { amount }),
  };

  const motionProps =
    trigger === "mount"
      ? { initial: FADE_UP.hidden, animate: FADE_UP.visible }
      : { variants: FADE_UP, initial: "hidden", whileInView: "visible" as const, viewport };

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
