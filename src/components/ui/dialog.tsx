"use client";

import { useEffect, type ReactNode } from "react";
import { m, AnimatePresence, useReducedMotion } from "framer-motion";
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

type DialogVariantT = "curtain" | "modal";

type DialogPropsT = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
  /**
   * "curtain" (default): full-viewport coloured panel slides in from the top.
   * "modal": dim backdrop fades in, centered card scales/fades up.
   */
  variant?: DialogVariantT;
};

export function Dialog({
  isOpen,
  onClose,
  children,
  className,
  ariaLabel,
  variant = "curtain",
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

  if (variant === "modal") {
    return (
      <ModalDialog
        isOpen={isOpen}
        onClose={onClose}
        ariaLabel={ariaLabel}
        className={className}
      >
        {children}
      </ModalDialog>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <m.div
          key="dialog-overlay"
          className="fixed inset-0 z-[500] pointer-events-none"
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

function ModalDialog({
  isOpen,
  onClose,
  children,
  className,
  ariaLabel,
}: Omit<DialogPropsT, "variant">) {
  const reduced = useReducedMotion();
  return (
    <AnimatePresence>
      {isOpen && (
        <m.div
          key="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel}
          className={cn(
            "fixed inset-0 z-[500] overflow-y-auto overscroll-contain bg-off-black/40 p-4",
            className
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={reduced ? { duration: 0 } : { duration: 0.25 }}
          onClick={onClose}
        >
          <div className="flex min-h-full items-center justify-center">
            <m.div
              className="w-full flex justify-center"
              initial={
                reduced ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }
              }
              animate={
                reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }
              }
              exit={
                reduced ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }
              }
              transition={
                reduced
                  ? { duration: 0 }
                  : { type: "spring", damping: 25, stiffness: 300 }
              }
            >
              {children}
            </m.div>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
