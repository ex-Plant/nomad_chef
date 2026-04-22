"use client";

import { useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import { EASE } from "@/config/animation-constants";
import { NAV_TOGGLE_COLORS } from "@/config/section-ids";
import type { NavToggleColorT, SectionIdT } from "@/config/section-ids";
import { CONTENT } from "@/config/content";
import type { SiteT } from "@/lib/get-site";
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

const MOBILE_TOGGLE_PATH =
  "m 20 40 h 60 a 1 1 0 0 1 0 20 h -60 a 1 1 0 0 1 0 -40 h 30 v 70";
const MOBILE_TOGGLE_DASH = {
  // Pull the dash boundary a fraction off the arc join where WebKit was
  // leaking a cap pixel. The visual delta is under a device pixel at 48px.
  closed: "59.75 31.25 60 300",
  open: "59.75 105.25 60 300",
} as const;

export function NavMobileToggle({
  isOpen,
  activeSection,
  onToggle,
}: Pick<NavMobilePropsT, "isOpen" | "activeSection" | "onToggle">) {
  const color = isOpen ? "coral" : NAV_TOGGLE_COLORS[activeSection];
  // Sync with curtain choreography below: open = 520ms, close = 820ms.
  const lineDurationMs = isOpen ? 520 : 820;

  return (
    <button
      type="button"
      onClick={onToggle}
      // variant="white"
      // size="icon-sm"
      className="md:hidden relative z-50"
      aria-label={
        isOpen ? CONTENT.nav.toggleCloseLabel : CONTENT.nav.toggleOpenLabel
      }
      aria-expanded={isOpen}
    >
      <svg
        aria-hidden="true"
        focusable="false"
        stroke="currentColor"
        fill="none"
        viewBox="-10 -10 105 120"
        width="48"
        className={cn(
          "transition-[translate,rotate,color]  -mr-1",
          STROKE_CLASS[color],
          isOpen && "translate-[-2px_-2px] rotate-45"
        )}
        style={{ transitionDuration: `${lineDurationMs}ms` }}
      >
        <path
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          d={MOBILE_TOGGLE_PATH}
          style={{
            transition: `${lineDurationMs}ms`,
            strokeDasharray: isOpen
              ? MOBILE_TOGGLE_DASH.open
              : MOBILE_TOGGLE_DASH.closed,
            strokeDashoffset: isOpen ? -90 : 0,
          }}
        />
      </svg>
    </button>
  );
}

const NAV_ITEM_TILTS = [-2.5, 1.8, -1.2, 2.2, -2, 1.4] as const;

const CURTAIN_EASE = [0.95, 0, 1, 0.25] as const;
const FIRST_DURATION = 0.38;
const SECOND_DURATION = 0.18;
const CORAL_ENTER_DURATION = FIRST_DURATION;
const YELLOW_ENTER_DURATION = SECOND_DURATION;
const YELLOW_EXIT_DURATION = FIRST_DURATION;
const CORAL_EXIT_DURATION = SECOND_DURATION;
const STAGE_GAP = -0.04;
/** Gap between first-curtain-start and second-curtain-start. Same both ways. */
const CURTAIN_GAP = FIRST_DURATION + STAGE_GAP;
const MENU_ITEM_DELAY_BASE = CURTAIN_GAP + SECOND_DURATION * 0.5;
const EXIT_ITEM_DURATION = 0.24;
const EXIT_ITEM_STAGGER = 0.03;
const EXIT_CURTAIN_DELAY = EXIT_ITEM_DURATION + EXIT_ITEM_STAGGER * 2;

const CORAL_VARIANTS = {
  hidden: { y: "-100%" },
  visible: {
    y: "0%",
    transition: { duration: CORAL_ENTER_DURATION, ease: CURTAIN_EASE },
  },
  exit: {
    y: "-100%",
    transition: {
      duration: CORAL_EXIT_DURATION,
      ease: CURTAIN_EASE,
      delay: EXIT_CURTAIN_DELAY + CURTAIN_GAP,
    },
  },
} as const;

const YELLOW_VARIANTS = {
  hidden: { y: "-100%" },
  visible: {
    y: "0%",
    transition: {
      duration: YELLOW_ENTER_DURATION,
      ease: CURTAIN_EASE,
      delay: CURTAIN_GAP,
    },
  },
  exit: {
    y: "-100%",
    transition: {
      duration: YELLOW_EXIT_DURATION,
      ease: CURTAIN_EASE,
      delay: EXIT_CURTAIN_DELAY,
    },
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
          key="mobile-overlay"
          className="fixed inset-0 z-40 md:hidden pointer-events-none "
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 1 }}
          transition={{
            duration: EXIT_CURTAIN_DELAY + CURTAIN_GAP + CORAL_EXIT_DURATION,
          }}
        >
          {/* Stage 1 — coral drops from top */}
          {/* <m.div
            className="absolute inset-0 bg-coral"
            variants={CORAL_VARIANTS}
            initial="hidden"
            animate="visible"
            exit="exit"
          /> */}
          {/* Stage 2 — yellow + menu content rises from bottom, covers coral */}
          <m.div
            className="absolute inset-0 bg-yellow pointer-events-auto flex items-center justify-center overflow-hidden"
            variants={YELLOW_VARIANTS}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Starburst
              color="pink"
              size="md"
              className={cn(
                "absolute left-[0%] bottom-[0%] duration-500",
                isOpen ? "opacity-100" : "opacity-0"
              )}
              variant="v1-a"
            />
            <div className="relative z-10 flex flex-col items-center gap-8">
              {items.map((item, i) => (
                <m.button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{
                    opacity: 0,
                    y: -12,
                    transition: {
                      duration: EXIT_ITEM_DURATION,
                      ease: CURTAIN_EASE,
                      delay: (items.length - 1 - i) * EXIT_ITEM_STAGGER,
                    },
                  }}
                  transition={{
                    duration: 0.35,
                    ease: EASE,
                    delay: MENU_ITEM_DELAY_BASE + i * 0.05,
                  }}
                  style={{
                    rotate: `${NAV_ITEM_TILTS[i % NAV_ITEM_TILTS.length]}deg`,
                  }}
                  className="text-4xl uppercase bg-coral text-white pl-1 pr-4"
                >
                  {item.label}
                </m.button>
              ))}
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
