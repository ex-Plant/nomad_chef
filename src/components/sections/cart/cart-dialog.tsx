"use client";

import { Dialog } from "@/components/ui/dialog";
import { RichText } from "@payloadcms/richtext-lexical/react";
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
        className="bg-coral ring-yellow relative flex max-h-[calc(100dvh-2rem)] w-full max-w-[28rem] flex-col overflow-clip rounded-lg ring-[2px] md:max-w-[42rem]"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -top-8 -right-12 z-[0] flex items-center justify-center"
        >
          <Starburst color="pink" variant="organic" size="md" />
        </div>

        <div className="relative z-10 overflow-y-auto overscroll-contain p-6 md:p-8">
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
            <div className="mb-6 font-sans text-sm leading-relaxed text-white/90 [&_a]:underline [&_a]:underline-offset-2 [&_a]:hover:text-yellow [&_p]:mb-2 [&_strong]:font-semibold [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5">
              <RichText
                data={product.description as unknown as SerializedEditorState}
              />
            </div>
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
