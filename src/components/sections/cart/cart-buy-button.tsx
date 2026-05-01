"use client";

import { useState } from "react";
import { Button } from "@/components/shared/button";
import type { Product } from "@/payload-types";
import { CartDialog } from "./cart-dialog";
import { CartSuccessDialog } from "./cart-success-dialog";

type CartBuyButtonPropsT = {
  product: Product | null;
  label: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
  className?: string;
};

type SuccessStateT = { orderNumber: string; email: string } | null;

export function CartBuyButton({
  product,
  label,
  variant = "coral-solid",
  size = "default",
  className,
}: CartBuyButtonPropsT) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [success, setSuccess] = useState<SuccessStateT>(null);
  if (!product) return null;
  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={className}
        onClick={() => setIsCartOpen(true)}
      >
        {label}
      </Button>
      <CartDialog
        product={product}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOrderPlaced={(orderNumber, email) => {
          setIsCartOpen(false);
          setSuccess({ orderNumber, email });
        }}
      />
      <CartSuccessDialog
        isOpen={success !== null}
        onClose={() => setSuccess(null)}
        orderNumber={success?.orderNumber ?? ""}
        email={success?.email ?? ""}
      />
    </>
  );
}
