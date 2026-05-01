"use client";

import { Dialog } from "@/components/ui/dialog";
import { Starburst } from "@/components/shared/starburst";
import { ScatterText } from "@/components/shared/scatter-text";
import { CloseToggle } from "@/components/shared/close-toggle";

type CartSuccessDialogPropsT = {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  email: string;
};

export function CartSuccessDialog({
  isOpen,
  onClose,
}: CartSuccessDialogPropsT) {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      ariaLabel="Zamówienie przyjęte"
      variant="modal"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-fit flex flex-col rounded-lg bg-yellow relative overflow-clip ring-[2px] ring-coral pb-3 px-3"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -top-12 -right-16 z-[0] flex items-center justify-center"
        >
          <Starburst color="pink" variant="organic" size="md" />
        </div>

        <div className="relative z-10 p-3 md:p-4">
          <div className="flex justify-end">
            <CloseToggle
              onClick={onClose}
              iconClassName="text-yellow"
              size={40}
              className="-mt-1 -mr-2"
            />
          </div>
          <div className="relative text-center text-white">
            <ScatterText
              as="h2"
              triggerOnMount
              className="text-heading-lg text-white bg-coral rotate-1 py-1 pr-4 pl-4"
              lines={[{ text: "Dziękuję!" }]}
            />
            <div className="font-sans text-sm w-fit mt-1">
              <p className=" text-black w-fit px-1 pr-2">Zamówienie przyjęte</p>
              <p className="bg-yellow text-black  px-1 pr-2">
                Odezwę się z danymi do przelewu
              </p>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
