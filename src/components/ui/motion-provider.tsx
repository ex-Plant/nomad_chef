"use client";

import { LazyMotion, domAnimation } from "framer-motion";
import type { ReactNode } from "react";

type MotionProviderPropsT = {
  children: ReactNode;
};

export function MotionProvider({ children }: MotionProviderPropsT) {
  return <LazyMotion features={domAnimation}>{children}</LazyMotion>;
}
