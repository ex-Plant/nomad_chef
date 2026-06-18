"use client";

import { useState } from "react";
import { Button } from "@/components/shared/button";
import type { Product } from "@/payload-types";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import type { SiteT } from "@/types/site";
import { CartDialog } from "./cart-dialog";

type CartBuyButtonPropsT = {
  product: Product | null;
  label: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
  className?: string;
  legal?: SerializedEditorState | null;
  legalLinks?: SiteT["legalLinks"];
};

export function CartBuyButton({
  product,
  label,
  variant = "coral-solid",
  size = "default",
  className,
  legal = null,
  legalLinks,
}: CartBuyButtonPropsT) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  if (!product) return null;
  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={className}
        aria-haspopup="dialog"
        aria-expanded={isCartOpen}
        onClick={() => setIsCartOpen(true)}
      >
        {label}
      </Button>
      <CartDialog
        product={product}
        legal={legal}
        legalLinks={legalLinks}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </>
  );
}
