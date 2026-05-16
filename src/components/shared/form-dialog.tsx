"use client";

import type { ReactNode } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Starburst } from "@/components/shared/starburst";
import { CloseToggle } from "@/components/shared/close-toggle";

type FormDialogPropsT = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
};

export function FormDialog({
  isOpen,
  onClose,
  title,
  description,
  children,
}: FormDialogPropsT) {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} ariaLabel={title} variant="modal">
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-coral ring-yellow relative w-full max-w-md overflow-clip rounded-lg ring-2"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -top-8 -right-12 z-0 flex items-center justify-center"
        >
          <Starburst color="pink" variant="organic" size="md" />
        </div>

        <div className="relative z-10 p-6 md:p-8">
          <h3 className="font-display text-electric-blue mb-4 pr-12 text-2xl uppercase">
            {title}
          </h3>

          {description && (
            <p className="mb-6 font-sans text-sm leading-relaxed text-white/90">
              {description}
            </p>
          )}

          {children}
        </div>

        <CloseToggle
          onClick={onClose}
          iconClassName="text-yellow"
          size={40}
          className="absolute top-5 right-4 z-20"
        />
      </div>
    </Dialog>
  );
}
