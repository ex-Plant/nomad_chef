"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
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
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      ariaLabel="Zamówienie"
      variant="modal"
    >
      <div className="hide-scrollbar w-[min(100%,28rem)] max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain rounded-lg bg-white px-6 pb-8 ">
        <button
          type="button"
          onClick={handleClose}
          aria-label="Zamknij"
          className="sticky top-2 z-10 -mr-2 ml-auto mb-3 flex h-10 w-10 cursor-pointer items-center justify-end bg-white text-coral transition-transform duration-300 ease-brand hover:scale-110 active:scale-95"
        >
          <X size={24} strokeWidth={2.75} aria-hidden="true" />
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
  );
}
