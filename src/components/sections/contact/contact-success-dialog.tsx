"use client";

import { Button } from "@/components/shared/button";
import { Dialog } from "@/components/ui/dialog";
import { Starburst } from "@/components/shared/starburst";
import { ScatterText } from "@/components/shared/scatter-text";

type ContactSuccessDialogPropsT = {
  isOpen: boolean;
  onClose: () => void;
};

export function ContactSuccessDialog({
  isOpen,
  onClose,
}: ContactSuccessDialogPropsT) {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      ariaLabel="Wiadomość wysłana"
      className="bg-yellow"
    >
      <div className={` h-full w-full relative  `}>
        <div className=" flex flex-col items-center gap-4 p-12 text-center text-white relative">
          <ScatterText
            as="h2"
            triggerOnMount
            className="text-heading-lg text-white bg-coral -rotate-1 py-1 pr-4 pl-1"
            lines={[{ text: "Dziękuję!" }]}
          />
          <div className=" font-sans text-sm  md:text-base  flex flex-col items-center gap-1 ">
            <p className={` bg-coral text-white w-fit`}>
              Wiadomość już do mnie leci.
            </p>
            <p className={` bg-coral text-white w-fit`}>
              Odezwę się tak szybko, jak to możliwe.
            </p>
          </div>
          <Button onClick={onClose} variant="coral" size="compact">
            Zamknij
          </Button>
        </div>
        <Starburst
          color="pink"
          variant="logo-c"
          size="sm"
          className="absolute -top-4 left-0  md:-top-16 md:-left-16  z-1 "
        />
      </div>
    </Dialog>
  );
}
