"use client";

import { Button } from "@/components/shared/button";
import { Starburst } from "@/components/shared/starburst";
import { ScatterText } from "@/components/shared/scatter-text";

type CartSuccessViewPropsT = {
  orderNumber: string;
  email: string;
  onClose: () => void;
};

export function CartSuccessView({
  orderNumber,
  email,
  onClose,
}: CartSuccessViewPropsT) {
  return (
    <div className="relative h-full w-full">
      <div className="relative flex flex-col items-center gap-4 p-12 text-center text-white">
        <ScatterText
          as="h2"
          triggerOnMount
          className="text-heading-lg text-white bg-coral -rotate-1 py-1 pr-4 pl-1"
          lines={[{ text: "Dziękuję!" }]}
        />
        <div className="font-sans text-sm md:text-base flex flex-col items-center gap-1">
          <p className="bg-coral text-white w-fit">
            Zamówienie {orderNumber}
          </p>
          <p className="bg-coral text-white w-fit">
            Odezwę się z danymi do przelewu na {email}
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
        className="absolute -top-4 left-0 md:-top-16 md:-left-16 z-1"
      />
    </div>
  );
}
