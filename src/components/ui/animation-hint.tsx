"use client";

import { AnimationTogglePot as AnimationToggle } from "@/components/shared/animation-toggle-pot/animation-toggle-pot";

/* Shown on initial load. Introduces the animation toggle so users on weaker
   devices know the escape hatch exists. Dismissed only via the X button.
   Session-only — no persistence.

   Plain <div> rather than framer-motion: the opacity-fade is done with a
   CSS animate-in utility instead. framer-motion was promoting this wrapper
   to its own GPU compositor layer, which was clipping the toggle's bubbles
   at the layer's bounding box despite no CSS overflow rules. */
export function AnimationHint() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-0 right-0  fest-container max-w-[1440px] mx-auto z-60  rounded-xl items-center w-fit  scroll p-2 hidden lg:flex animate-in fade-in duration-300"
    >
      <AnimationToggle />
    </div>
  );
}
