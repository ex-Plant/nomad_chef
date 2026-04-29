"use client";

import { useState } from "react";
import { Button } from "@/components/shared/button";
import type { Product } from "@/payload-types";
import { CartDialog } from "./cart-dialog";

type CartBuyButtonPropsT = {
  product: Product | null;
  label: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
  className?: string;
};

export function CartBuyButton({
  product,
  label,
  variant = "coral-solid",
  size = "default",
  className,
}: CartBuyButtonPropsT) {
  const [isOpen, setIsOpen] = useState(false);
  if (!product) return null;
  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={className}
        onClick={() => setIsOpen(true)}
      >
        {label}
      </Button>
      <CartDialog
        product={product}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
