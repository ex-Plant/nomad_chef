"use client";

import { useEffect, type ReactNode } from "react";
import { m, AnimatePresence } from "framer-motion";
import { useScrollLock } from "@/hooks/use-scroll-lock";
import { cn } from "@/helpers/cn";

const CURTAIN_EASE = [0.95, 0, 1, 0.25] as const;
const CURTAIN_ENTER_DURATION = 0.45;
const CURTAIN_EXIT_DURATION = 0.4;
const CONTENT_EXIT_DURATION = 0.24;
/** Content fades/exits first, then the curtain retracts. */
const CURTAIN_EXIT_DELAY = CONTENT_EXIT_DURATION + 0.06;

const CURTAIN_VARIANTS = {
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
      delay: CURTAIN_EXIT_DELAY,
    },
  },
} as const;

const CONTENT_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: [0.22, 1, 0.36, 1] as const,
      delay: CURTAIN_ENTER_DURATION * 0.5,
    },
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: { duration: CONTENT_EXIT_DURATION, ease: CURTAIN_EASE },
  },
} as const;

type DialogPropsT = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
};

export function Dialog({
  isOpen,
  onClose,
  children,
  className,
  ariaLabel,
}: DialogPropsT) {
  useScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <m.div
          key="dialog-overlay"
          className="fixed inset-0 z-[400] pointer-events-none"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 1 }}
          transition={{
            duration: CURTAIN_EXIT_DELAY + CURTAIN_EXIT_DURATION,
          }}
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel}
        >
          <m.div
            className={cn(
              "absolute inset-0 pointer-events-auto flex items-center justify-center overflow-hidden bg-yellow",
              className
            )}
            variants={CURTAIN_VARIANTS}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          >
            <m.div
              className="relative z-10"
              variants={CONTENT_VARIANTS}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              {children}
            </m.div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
