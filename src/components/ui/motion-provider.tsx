"use client";

import { LazyMotion, MotionConfig, domAnimation } from "framer-motion";
import type { ReactNode } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

type MotionProviderPropsT = {
  children: ReactNode;
};

/* Global framer-motion config. When reducedMotion is on, MotionConfig
   reducedMotion="always" causes every <m.*> component to skip transforms
   and snap to final state — one setting covers every motion div in the app
   (FadeUp, BodyText, nav curtains, mobile menu items, about, camp-food). */
export function MotionProvider({ children }: MotionProviderPropsT) {
  const reducedMotion = useReducedMotion();
  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion={reducedMotion ? "always" : "never"}>
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}
