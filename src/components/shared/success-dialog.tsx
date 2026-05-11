"use client";

import { Dialog } from "@/components/ui/dialog";
import { Starburst } from "@/components/shared/starburst";
import { ScatterText } from "@/components/shared/scatter-text";
import { Button } from "@/components/shared/button";

type SuccessDialogPropsT = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  body: string;
  ariaLabel?: string;
};

export function SuccessDialog({
  isOpen,
  onClose,
  title,
  body,
  ariaLabel,
}: SuccessDialogPropsT) {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      ariaLabel={ariaLabel ?? title}
      className="bg-coral"
    >
      <div className="relative flex flex-col items-center gap-6 px-6 text-center text-white">
        <Starburst
          color="blue"
          variant="logo-c"
          className="absolute -top-24 right-0 w-24 opacity-90 md:-top-32 md:w-32"
          rotate
        />
        <ScatterText
          as="h2"
          triggerOnMount
          className="text-heading-lg -rotate-2"
          lines={[{ text: title }]}
        />
        <p className="bg-yellow max-w-[320px] pr-2 pl-1 font-sans text-sm text-black sm:max-w-sm sm:text-base md:max-w-lg">
          {body}
        </p>
        <Button onClick={onClose} variant="yellow" size="compact">
          Zamknij
        </Button>
      </div>
    </Dialog>
  );
}
