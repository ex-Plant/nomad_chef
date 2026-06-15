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
  isLoggedIn: boolean;
};

export function CartBuyButton({
  product,
  label,
  variant = "coral-solid",
  size = "default",
  className,
  legal = null,
  legalLinks,
  isLoggedIn,
}: CartBuyButtonPropsT) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  // Pre-launch: hide the purchase CTA from anonymous visitors so nobody can
  // place a real order by accident. Logged-in (CMS) users can still test it.
  // TEMP: auth gate disabled — buy button shown to everyone. Restore the line below.
  // if (!isLoggedIn) return null;
  void isLoggedIn;
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
        // On success, cart-form does a full nav to the P24 paywall
        // (window.location.href). Do NOT also router.push here — a client-side
        // push to the (prefetched) processing route races and can win, skipping
        // the paywall entirely. P24's urlReturn brings the buyer to /checkout/
        // processing after paying.
        onOrderPlaced={() => setIsCartOpen(false)}
      />
    </>
  );
}
