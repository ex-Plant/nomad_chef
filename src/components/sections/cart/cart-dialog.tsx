"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Starburst } from "@/components/shared/starburst";
import { CloseToggle } from "@/components/shared/close-toggle";
import type { Product } from "@/payload-types";
import { CartForm } from "./cart-form";
import { CartSuccessView } from "./cart-success-view";

type StatusT =
  | { kind: "form" }
  | { kind: "success"; orderNumber: string; email: string };

type CartDialogPropsT = {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
};

export function CartDialog({ product, isOpen, onClose }: CartDialogPropsT) {
  const [status, setStatus] = useState<StatusT>({ kind: "form" });

  function handleClose() {
    onClose();
    // Reset to "form" so that the next time the dialog opens it shows the
    // form, not the previous success view. AnimatePresence covers the
    // exit animation, so reset is safe to do synchronously.
    setStatus({ kind: "form" });
  }

  return (
    <>
      <Dialog
        isOpen={isOpen}
        onClose={handleClose}
        ariaLabel="Zamówienie"
        variant="modal"
      >
        <div className="w-full max-w-[28rem] md:max-w-[42rem] rounded-lg bg-coral px-6 md:px-8 pt-6 pb-8 relative overflow-clip ring-[1px] ring-yellow">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-8 -right-12 z-[0] flex items-center justify-center"
          >
            <Starburst color="pink" variant="organic" size="md" />
          </div>

          {status.kind === "form" && (
            <div className="relative z-10 flex items-start justify-between gap-4">
              <h3 className="font-display text-2xl uppercase text-electric-blue">
                {product.title}
              </h3>
              <CloseToggle
                onClick={handleClose}
                iconClassName="text-yellow"
                size={40}
                className="-mt-1 -mr-2"
              />
            </div>
          )}

          {status.kind === "form" && (
            <CartForm
              product={product}
              onSuccess={(orderNumber, email) =>
                setStatus({ kind: "success", orderNumber, email })
              }
            />
          )}
          {status.kind === "success" && (
            <CartSuccessView
              orderNumber={status.orderNumber}
              email={status.email}
              onClose={handleClose}
            />
          )}
        </div>
      </Dialog>
    </>
  );
}
