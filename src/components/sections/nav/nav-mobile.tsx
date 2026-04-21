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
        stroke="currentColor"
        fill="none"
        viewBox="0 0 96 96"
        width="48"
        className={cn(
          "overflow-visible transition-colors",
          STROKE_CLASS[color]
        )}
        style={{ transitionDuration: `${lineDurationMs}ms` }}
      >
        <g
          className="origin-center transition-transform"
          style={{
            transitionDuration: `${lineDurationMs}ms`,
            transform: isOpen
              ? "translate(-2px, -2px) rotate(45deg)"
              : "translate(0, 0) rotate(0)",
          }}
        >
          <path
            strokeWidth="8"
            strokeLinecap="round"
            d="M 18 40 H 78"
            className="transition-transform"
            style={{
              transitionDuration: `${lineDurationMs}ms`,
              transform: isOpen
                ? "translate(0, 10px)"
                : "translate(0, 0)",
            }}
          />
          <path
            strokeWidth="8"
            strokeLinecap="round"
            d="M 18 60 H 78"
            className="transition-transform"
            style={{
              transitionDuration: `${lineDurationMs}ms`,
              transform: isOpen
                ? "translate(0, -10px) rotate(90deg)"
                : "translate(0, 0) rotate(0)",
            }}
          />
        </g>
      </svg>
    </button>
  );
}

/**
 * Random-looking rotation per nav item. Add/remove entries or tweak magnitudes
 * to change how "playful" the stack looks. Values are degrees.
 */
const NAV_ITEM_TILTS = [-2.5, 1.8, -1.2, 2.2, -2, 1.4] as const;

/* ─────────────────────────────────────────────────────────────
 * MOBILE MENU — CURTAIN CHOREOGRAPHY
 * ─────────────────────────────────────────────────────────────
 * Two-stage drop: coral falls from the top, then yellow falls on top of it
 * carrying the menu items. Exit reverses the order (items fade, yellow lifts,
 * coral lifts).
 *
 * Timeline (enter):
 *   0 ────────► CORAL_DURATION ── STAGE_GAP ──► YELLOW_DURATION ──► items fade in
 *   [coral drop]                  [yellow drop]          [items delayed by MENU_ITEM_DELAY_BASE + i*0.05]
 *
 * Timeline (exit):
 *   0 ──► items fade ──► yellow lifts ── STAGE_GAP ──► coral lifts
 *        (EXIT_ITEM_DURATION + stagger ends at EXIT_CURTAIN_DELAY)
 *
 * ── Knobs you will actually touch ──
 *
 * CURTAIN_EASE
 *   Cubic-bezier [p1x, p1y, p2x, p2y]. Current curve is aggressive ease-in:
 *   barely moves at the start, rockets at the end ("laggy snap").
 *   • Softer ease-in (less lag):       [0.7, 0, 0.84, 0]   ← original feel
 *   • Medium ease-in:                  [0.88, 0, 0.95, 0.1]
 *   • Current, very laggy:             [0.95, 0, 1, 0.25]
 *   • Symmetric ease-in-out:           [0.65, 0, 0.35, 1]
 *   • Classic ease-out (snap first):   [0.16, 1, 0.3, 1]
 *   Play at https://cubic-bezier.com
 *
 * FIRST_DURATION / SECOND_DURATION (seconds)
 *   Role-based durations. The leading curtain always takes FIRST_DURATION,
 *   the follower always takes SECOND_DURATION — independent of which color
 *   it happens to be. Keep SECOND shorter for the "catches up" feel.
 *   Try 0.45/0.3 for slower, 0.28/0.18 for snappy.
 *
 * STAGE_GAP (seconds)
 *   Overlap between the two curtain stages. Negative = they overlap (yellow
 *   starts before coral finishes). 0 = back-to-back. Positive = a pause.
 *
 * EXIT_ITEM_DURATION / EXIT_ITEM_STAGGER
 *   How menu items disappear on close. Duration too short and the ease
 *   becomes invisible — bump to 0.3+ to really feel the lag.
 *
 * MENU_ITEM_DELAY_BASE
 *   When items start fading IN during open. Tied to the curtain timing so
 *   items appear as the yellow panel is mid-drop.
 *
 * ── Sync with the hamburger icon ──
 * The toggle SVG uses `duration-[600ms]` (see NavMobileToggle above).
 * Total curtain-in time = CORAL_DURATION + STAGE_GAP + YELLOW_DURATION.
 * If you change the durations here, update the SVG's `duration-[Xms]` and
 * the inline `transition: "600ms"` on the <path> to match.
 * ───────────────────────────────────────────────────────────── */
const CURTAIN_EASE = [0.95, 0, 1, 0.25] as const;
/**
 * Durations are role-based, not color-based:
 *   FIRST_DURATION  — the leading curtain (slow, laggy). Always the longer one.
 *   SECOND_DURATION — the follower that "catches up" (shorter).
 * On enter: coral = first, yellow = second.
 * On exit: yellow = first, coral = second (sequence reverses).
 * This keeps the "long leader → short catcher" feel identical both directions.
 */
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
          className="fixed inset-0 z-40 md:hidden pointer-events-none overflow-hidden"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 1 }}
          transition={{
            duration: EXIT_CURTAIN_DELAY + CURTAIN_GAP + CORAL_EXIT_DURATION,
          }}
        >
          {/* Stage 1 — coral drops from top */}
          <m.div
            className="absolute inset-0 bg-coral/90"
            variants={CORAL_VARIANTS}
            initial="hidden"
            animate="visible"
            exit="exit"
          />
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
              className="absolute left-[0%] bottom-[0%]"
              variant="v1-a"
            />
            {/* <Starburst
              color="coral"
              size="lg"
              className="absolute left-[-11%] bottom-[-7%]"
            /> */}
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
