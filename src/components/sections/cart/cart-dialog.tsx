"use client";

import { Dialog } from "@/components/ui/dialog";
import { Starburst } from "@/components/shared/starburst";
import { CloseToggle } from "@/components/shared/close-toggle";
import type { Product } from "@/payload-types";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import type { SiteT } from "@/lib/get-site";
import { CartForm } from "./cart-form";

type CartDialogPropsT = {
  product: Product;
  legal?: SerializedEditorState | null;
  legalLinks?: SiteT["legalLinks"];
  isOpen: boolean;
  onClose: () => void;
  onOrderPlaced: (orderNumber: string, email: string) => void;
};

export function CartDialog({
  product,
  legal = null,
  legalLinks,
  isOpen,
  onClose,
  onOrderPlaced,
}: CartDialogPropsT) {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      ariaLabel="Zamówienie"
      variant="modal"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[28rem] md:max-w-[42rem] max-h-[calc(100dvh-2rem)] flex flex-col rounded-lg bg-coral relative overflow-clip ring-[2px] ring-yellow"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -top-8 -right-12 z-[0] flex items-center justify-center"
        >
          <Starburst color="pink" variant="organic" size="md" />
        </div>

        <div className="relative z-10 overflow-y-auto overscroll-contain p-6 md:p-8">
          <div className="flex items-start justify-between gap-8 mb-4">
            <h3 className="font-display text-2xl uppercase text-electric-blue">
              {product.title}
            </h3>
            <CloseToggle
              onClick={onClose}
              iconClassName="text-yellow"
              size={40}
              className="-mt-1 -mr-2"
            />
          </div>

          <CartForm
            product={product}
            legal={legal}
            legalLinks={legalLinks}
            onSuccess={onOrderPlaced}
          />
        </div>
      </div>
    </Dialog>
  );
}
