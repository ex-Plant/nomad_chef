"use client";

import { useState } from "react";
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
      className="bg-yellow"
    >
      <div className="w-[min(90vw,32rem)] rounded-lg bg-yellow p-6 md:p-8">
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
