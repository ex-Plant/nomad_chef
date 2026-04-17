"use client";

import { useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import { EASE } from "@/config/animation-constants";
import { NAV_TOGGLE_COLORS } from "@/config/section-ids";
import type { NavToggleColorT, SectionIdT } from "@/config/section-ids";
import { CONTENT } from "@/config/content";
import type { SiteT } from "@/lib/get-site";
import { FadeUp } from "@/components/shared/fade-up";
import { Starburst } from "@/components/shared/starburst";
import { cn } from "@/helpers/cn";

type NavMobilePropsT = {
  items: SiteT["nav"];
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
      className="md:hidden"
      aria-label={
        isOpen ? CONTENT.nav.toggleCloseLabel : CONTENT.nav.toggleOpenLabel
      }
      aria-expanded={isOpen}
    >
      <svg
        stroke="currentColor"
        fill="none"
        viewBox="-10 -10 105 120"
        width="48"
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

const NAV_ITEM_TILTS = [-2.5, 1.8, -1.2, 2.2, -2, 1.4] as const;

const OVERLAY_VARIANTS = {
  hidden: { opacity: 0, y: -32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: EASE },
  },
  exit: {
    opacity: 0,
    y: -32,
    transition: { duration: 0.5, ease: EASE, delay: 0.25 },
  },
} as const;

export function NavMobileOverlay({
  items,
  isOpen,
  scrollTo,
}: Pick<NavMobilePropsT, "items" | "isOpen" | "scrollTo">) {
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
              <FadeUp
                key={item.id}
                trigger="mount"
                delay={i * 0.04}
                duration={0.5}
              >
                <button
                  onClick={() => scrollTo(item.id)}
                  style={{
                    rotate: `${NAV_ITEM_TILTS[i % NAV_ITEM_TILTS.length]}deg`,
                  }}
                  className=" text-4xl uppercase bg-coral text-white pl-1 pr-4"
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
