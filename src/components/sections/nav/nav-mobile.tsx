"use client";

import { useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import { EASE } from "@/config/animation-constants";
import { NAV_ITEMS, NAV_TOGGLE_COLORS } from "@/config/section-ids";
import type { NavToggleColorT, SectionIdT } from "@/config/section-ids";
import { FadeUp } from "@/components/shared/fade-up";
import { Starburst } from "@/components/shared/starburst";
import { cn } from "@/helpers/cn";

type NavMobilePropsT = {
  isOpen: boolean;
  isOnYellow: boolean;
  activeSection: SectionIdT;
  onToggle: () => void;
  scrollTo: (id: string) => void;
};

const STROKE_CLASS: Record<NavToggleColorT, string> = {
  yellow: "text-yellow",
  coral: "text-coral",
};

export function NavMobileToggle({
  isOpen,
  activeSection,
  onToggle,
}: Pick<NavMobilePropsT, "isOpen" | "activeSection" | "onToggle">) {
  const color = NAV_TOGGLE_COLORS[activeSection];

  return (
    <button
      onClick={onToggle}
      // variant="white"
      // size="icon-sm"
      className="md:hidden size-12 items-center bg-transparent! border-transparent!"
      aria-label={isOpen ? "Zamknij menu" : "Otworz menu"}
      aria-expanded={isOpen}
    >
      <svg
        stroke="currentColor"
        fill="none"
        viewBox="-10 -10 105 120"
        width="36"
        className={cn(
          "transition-[translate,rotate,color] duration-500 ",
          STROKE_CLASS[color],
          isOpen && "translate-[-2px_-2px] rotate-45"
        )}
      >
        <path
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m 20 40 h 60 a 1 1 0 0 1 0 20 h -60 a 1 1 0 0 1 0 -40 h 30 v 70"
          style={{
            transition: "1s",
            strokeDasharray: isOpen ? "60 105 60 300" : "60 31 60 300",
            strokeDashoffset: isOpen ? -90 : 0,
          }}
        />
      </svg>
    </button>
  );
}

const OVERLAY_VARIANTS = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, ease: EASE, staggerChildren: 0.06 },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: EASE,
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
} as const;

export function NavMobileOverlay({
  isOpen,
  scrollTo,
}: Pick<NavMobilePropsT, "isOpen" | "scrollTo">) {
  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", isOpen);
    return () => document.body.classList.remove("overflow-hidden");
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <m.div
          className="fixed inset-0 z-40 flex items-center justify-center bg-yellow md:hidden"
          variants={OVERLAY_VARIANTS}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <Starburst
            color="pink"
            size="lg"
            className="absolute left-[01%] bottom-[-7%]"
            variant="v1-b"
          />
          <Starburst
            color="coral"
            size="lg"
            className="absolute left-[-9%] bottom-[-5%]"
          />
          <div className="relative z-10 flex flex-col items-center gap-8">
            {NAV_ITEMS.map((item, i) => (
              <FadeUp key={item.id} delay={i * 0.02} duration={0.8}>
                <button
                  onClick={() => scrollTo(item.id)}
                  className="font-instrument text-4xl uppercase text-coral"
                >
                  {item.label}
                </button>
              </FadeUp>
            ))}
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
