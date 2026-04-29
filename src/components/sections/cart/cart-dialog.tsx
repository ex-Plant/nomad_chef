"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Starburst } from "@/components/shared/starburst";
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
        <div className="w-[min(100%,28rem)] md:w-[min(100%,60rem)] rounded-lg bg-coral px-6 md:px-8 pb-8 relative overflow-clip">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-8 -right-12 z-[0] flex items-center justify-center"
          >
            <Starburst color="pink" variant="organic" size="md" />
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Zamknij"
            className="sticky top-2 z-10 -mr-2 ml-auto mb-3 flex h-10 w-10 cursor-pointer items-center justify-end  text-yellow transition-transform duration-300 ease-brand hover:scale-110 active:scale-95"
          >
            <X size={32} strokeWidth={2.75} aria-hidden="true" />
          </button>
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
