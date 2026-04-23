"use client";

import { m, AnimatePresence } from "framer-motion";
import { AnimationTogglePot as AnimationToggle } from "@/components/shared/animation-toggle-pot/animation-toggle-pot";

/* Shown on initial load. Introduces the animation toggle so users on weaker
   devices know the escape hatch exists. Dismissed only via the X button.
   Session-only — no persistence. */
export function AnimationHint() {
  return (
    <AnimatePresence>
      <m.div
        role="status"
        aria-live="polite"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-0 right-0  z-60  rounded-xl items-center w-fit gap- scroll p-2 hidden md:flex "
      >
        <AnimationToggle />
      </m.div>
    </AnimatePresence>
  );
}
