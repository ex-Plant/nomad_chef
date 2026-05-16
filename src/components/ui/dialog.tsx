"use client";

import { type ReactNode } from "react";
import * as RDialog from "@radix-ui/react-dialog";
import { m, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/helpers/cn";

const CURTAIN_EASE = [0.95, 0, 1, 0.25] as const;
const CURTAIN_ENTER_DURATION = 0.45;
const CURTAIN_EXIT_DURATION = 0.4;
const CONTENT_EXIT_DURATION = 0.24;
/** Content fades/exits first, then the curtain retracts. */
const CURTAIN_EXIT_DELAY = CONTENT_EXIT_DURATION + 0.06;

const MODAL_EASE = [0.22, 1, 0.36, 1] as const;

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
  /** Used as the dialog's accessible name when no visible heading id is supplied. Rendered into a visually-hidden Title element. */
  ariaLabel?: string;
  /** id of a visible heading inside `children` — preferred over `ariaLabel` when a heading exists. */
  ariaLabelledBy?: string;
  /** id of descriptive text inside `children`. */
  ariaDescribedBy?: string;
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
  ariaLabelledBy,
  ariaDescribedBy,
  variant = "curtain",
}: DialogPropsT) {
  return (
    <RDialog.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <AnimatePresence>
        {isOpen && (
          <RDialog.Portal forceMount>
            {variant === "modal" ? (
              <ModalContent
                className={className}
                ariaLabel={ariaLabel}
                ariaLabelledBy={ariaLabelledBy}
                ariaDescribedBy={ariaDescribedBy}
              >
                {children}
              </ModalContent>
            ) : (
              <CurtainContent
                className={className}
                ariaLabel={ariaLabel}
                ariaLabelledBy={ariaLabelledBy}
                ariaDescribedBy={ariaDescribedBy}
              >
                {children}
              </CurtainContent>
            )}
          </RDialog.Portal>
        )}
      </AnimatePresence>
    </RDialog.Root>
  );
}

type ContentPropsT = {
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
};

function CurtainContent({
  children,
  className,
  ariaLabel,
  ariaLabelledBy,
  ariaDescribedBy,
}: ContentPropsT) {
  return (
    <RDialog.Overlay asChild forceMount>
      <m.div
        className={cn(
          "bg-yellow fixed inset-0 z-[500] flex items-center justify-center overflow-hidden",
          className,
        )}
        variants={CURTAIN_VARIANTS}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <RDialog.Content
          asChild
          forceMount
          aria-labelledby={ariaLabelledBy}
          aria-describedby={ariaDescribedBy}
        >
          <m.div
            className="relative z-10"
            variants={CONTENT_VARIANTS}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {ariaLabel && !ariaLabelledBy && (
              <RDialog.Title className="sr-only">{ariaLabel}</RDialog.Title>
            )}
            {children}
          </m.div>
        </RDialog.Content>
      </m.div>
    </RDialog.Overlay>
  );
}

function ModalContent({
  children,
  className,
  ariaLabel,
  ariaLabelledBy,
  ariaDescribedBy,
}: ContentPropsT) {
  const reduced = useReducedMotion();
  return (
    <RDialog.Overlay asChild forceMount>
      <m.div
        className={cn(
          "bg-coral/40 fixed inset-0 z-[500] overflow-y-auto overscroll-contain p-4",
          className,
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={reduced ? { duration: 0 } : { duration: 0.25 }}
      >
        <div className="flex min-h-full justify-center">
          <RDialog.Content
            asChild
            forceMount
            aria-labelledby={ariaLabelledBy}
            aria-describedby={ariaDescribedBy}
          >
            <m.div
              className="m-auto flex w-full justify-center"
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
              animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
              transition={
                reduced ? { duration: 0 } : { duration: 0.25, ease: MODAL_EASE }
              }
            >
              {ariaLabel && !ariaLabelledBy && (
                <RDialog.Title className="sr-only">{ariaLabel}</RDialog.Title>
              )}
              {children}
            </m.div>
          </RDialog.Content>
        </div>
      </m.div>
    </RDialog.Overlay>
  );
}
