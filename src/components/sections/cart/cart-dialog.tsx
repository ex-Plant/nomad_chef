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
        className="bg-coral ring-yellow relative w-full max-w-md overflow-clip rounded-lg ring-2 md:max-w-2xl"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -top-8 -right-12 z-0 flex items-center justify-center"
        >
          <Starburst color="pink" variant="organic" size="md" />
        </div>

        <div className="relative z-10 p-6 md:p-8">
          <div className="mb-4 flex items-start justify-between gap-8">
            <h3 className="font-display text-electric-blue text-2xl uppercase">
              {product.title}
            </h3>
            <CloseToggle
              onClick={onClose}
              iconClassName="text-yellow"
              size={40}
              className="-mt-1 -mr-2"
            />
          </div>

          {product.description && (
            <p className="mb-6 font-sans text-sm leading-relaxed whitespace-pre-line text-white/90">
              {product.description}
            </p>
          )}

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
