"use client";

import { useCallback, useEffect, useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { EASE } from "@/config/animation-constants";
import { NAV_TOGGLE_COLORS, SECTION_IDS } from "@/config/section-ids";
import type { NavToggleColorT, SectionIdT } from "@/config/section-ids";
import { CONTENT } from "@/config/content";
import type { SiteT } from "@/lib/get-site";
import { Starburst } from "@/components/shared/starburst";
import { cn } from "@/helpers/cn";
import { AnimationTogglePot as AnimationToggle } from "@/components/shared/animation-toggle-pot/animation-toggle-pot";
import { scrollToSection } from "@/helpers/scroll-to-section";
import { useScrollLock } from "@/hooks/use-scroll-lock";
import { useBreakpoint } from "@/hooks/use-media-query";
import { Logo } from "@/components/shared/logo";

/* Pixel offset used as the section-detection line — roughly the bottom of the
   toggle button at top-0. A section is "active" once its top crosses this line. */
const MOBILE_ACTIVE_LINE = 80;

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
  const color: NavToggleColorT = isOpen
    ? "coral"
    : NAV_TOGGLE_COLORS[activeSection];
  // Sync with curtain choreography below: open = 520ms, close = 820ms.
  const lineDurationMs = isOpen ? 520 : 820;

  return (
    <button
      type="button"
      onClick={onToggle}
      // variant="white"
      // size="icon-sm"
      className="lg:hidden relative z-50 -ml-3"
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
          "transition-[translate,rotate]  -mr-1",
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
const CURTAIN_ENTER_DURATION = 0.45;
const CURTAIN_EXIT_DURATION = 0.4;
const EXIT_ITEM_DURATION = 0.24;
const EXIT_ITEM_STAGGER = 0.03;
/** Items exit first, then the curtain retracts. */
const EXIT_CURTAIN_DELAY = EXIT_ITEM_DURATION + EXIT_ITEM_STAGGER * 2;
/** Menu items start animating when the curtain is ~halfway down. */
const MENU_ITEM_DELAY_BASE = CURTAIN_ENTER_DURATION * 0.5;

const YELLOW_VARIANTS = {
  hidden: { y: "-100%" },
  visible: {
    y: "0%",
    transition: { duration: CURTAIN_ENTER_DURATION, ease: CURTAIN_EASE },
  },
  exit: {
    y: "-100%",
    transition: {
      duration: CURTAIN_EXIT_DURATION,
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
  // Scroll lock lives in <Nav> (owner of isMobileOpen) — see useScrollLock.

  return (
    <AnimatePresence>
      {isOpen && (
        <m.div
          key="mobile-overlay"
          className="fixed inset-0 z-40 lg:hidden pointer-events-none"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 1 }}
          transition={{
            duration: EXIT_CURTAIN_DELAY + CURTAIN_EXIT_DURATION,
          }}
        >
          {/* Yellow curtain — drops from top, holds the menu. */}
          <m.div
            className="absolute inset-0 bg-yellow pointer-events-auto flex items-center justify-center overflow-hidden"
            variants={YELLOW_VARIANTS}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div
              className={`absolute bottom-0 fest-container right-0 left-0 flex justify-between  items-end`}
            >
              <Starburst
                color="coral"
                size="sm"
                className={cn(
                  " duration-500",
                  isOpen ? "opacity-100" : "opacity-0"
                )}
                variant="v1-a"
              />
              <m.div
                className="z-52"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{
                  opacity: 0,
                  y: -12,
                  transition: {
                    duration: EXIT_ITEM_DURATION,
                    ease: CURTAIN_EASE,
                  },
                }}
                transition={{
                  duration: 0.35,
                  ease: EASE,
                  delay: MENU_ITEM_DELAY_BASE + items.length * 0.05,
                }}
              >
                <AnimationToggle />
              </m.div>
            </div>
            <div className="relative z-51 flex flex-col items-center gap-8">
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

/* Mobile-only shell — owns scroll lock while open + an active-section tracker
   that drives the toggle color (mirrors the desktop logic, gated to <lg). */
export function NavMobileShell({ items }: { items: SiteT["nav"] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionIdT>(
    SECTION_IDS.hero
  );
  const isDesktop = useBreakpoint("lg");
  useScrollLock(isOpen);

  useEffect(() => {
    if (isDesktop) return;
    let rafId = 0;

    const update = () => {
      rafId = 0;

      const isAtBottom =
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight;

      if (isAtBottom) {
        setActiveSection((prev) =>
          prev === SECTION_IDS.contact ? prev : SECTION_IDS.contact
        );
        return;
      }

      let nextId: SectionIdT | null = null;
      for (const item of items) {
        const el = document.getElementById(item.id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top <= MOBILE_ACTIVE_LINE) nextId = item.id as SectionIdT;
        else break;
      }
      if (nextId) {
        setActiveSection((prev) => (prev === nextId ? prev : nextId));
      }
    };

    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [items, isDesktop]);

  const scrollTo = useCallback((id: string) => {
    setIsOpen(false);
    scrollToSection(id);
  }, []);

  return (
    <>
      <nav
        className="lg:hidden fixed -top-2 fest-container z-250 flex items-center justify-between"
        aria-label={CONTENT.nav.ariaLabel}
      >
        <NavMobileToggle
          isOpen={isOpen}
          activeSection={activeSection}
          onToggle={() => setIsOpen((v) => !v)}
        />
        <Logo priority />
      </nav>
      <NavMobileOverlay items={items} isOpen={isOpen} scrollTo={scrollTo} />
    </>
  );
}
