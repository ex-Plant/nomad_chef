"use client";

import { motion, AnimatePresence } from "framer-motion";
import { EASE } from "@/components/home/animation-constants";
import { NAV_ITEMS } from "@/components/home/section-ids";
import { FadeUp } from "@/components/home/fade-up";

type NavMobilePropsT = {
  isOpen: boolean;
  isOnYellow: boolean;
  onToggle: () => void;
  scrollTo: (id: string) => void;
};

const HAMBURGER_TRANSITION = { duration: 0.5, ease: EASE } as const;

type HamburgerLinePropsT = {
  isOpen: boolean;
  isOnYellow: boolean;
  openRotate: number;
  openY: number;
};

function HamburgerLine({
  isOpen,
  isOnYellow,
  openRotate,
  openY,
}: HamburgerLinePropsT) {
  const isLight = isOpen || isOnYellow;

  return (
    <motion.span
      className={`block h-px w-4 ${isLight ? "bg-white" : "bg-off-black"}`}
      animate={
        isOpen
          ? { rotate: openRotate, y: openY, width: 16 }
          : { rotate: 0, y: 0, width: 16 }
      }
      transition={HAMBURGER_TRANSITION}
    />
  );
}

export function NavMobileToggle({
  isOpen,
  isOnYellow,
  onToggle,
}: Pick<NavMobilePropsT, "isOpen" | "isOnYellow" | "onToggle">) {
  return (
    <button
      onClick={onToggle}
      className="relative flex h-8 w-8 flex-col items-center justify-center gap-[5px] md:hidden"
      aria-label={isOpen ? "Zamknij menu" : "Otworz menu"}
    >
      <HamburgerLine
        isOpen={isOpen}
        isOnYellow={isOnYellow}
        openRotate={45}
        openY={3}
      />
      <HamburgerLine
        isOpen={isOpen}
        isOnYellow={isOnYellow}
        openRotate={-45}
        openY={-3}
      />
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
    transition: { duration: 0.3, ease: EASE, staggerChildren: 0.03, staggerDirection: -1 },
  },
} as const;

export function NavMobileOverlay({
  isOpen,
  scrollTo,
}: Pick<NavMobilePropsT, "isOpen" | "scrollTo">) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center bg-yellow md:hidden"
          variants={OVERLAY_VARIANTS}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className="flex flex-col items-center gap-8">
            {NAV_ITEMS.map((item, i) => (
              <FadeUp key={item.id} delay={i * 0.06}>
                <button
                  onClick={() => scrollTo(item.id)}
                  className="font-instrument text-4xl text-off-black"
                >
                  {item.label}
                </button>
              </FadeUp>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
