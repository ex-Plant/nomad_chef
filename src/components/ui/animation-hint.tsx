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
    <div className="fest-container scroll animate-in fade-in fixed right-0 bottom-0 z-60 mx-auto hidden w-fit max-w-[1440px] items-center rounded-xl p-2 duration-300 lg:flex">
      <AnimationToggle />
    </div>
  );
}
