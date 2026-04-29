"use client";

import { AddressFields } from "./address-fields";
import type { CartFormApiT } from "./types";

type ShippingFieldsPropsT = {
  form: CartFormApiT;
  disabled?: boolean;
};

export function ShippingFields({ form, disabled }: ShippingFieldsPropsT) {
  return (
    <div className="flex flex-col gap-3">
      <p className="font-sans text-sm font-medium uppercase tracking-wide text-electric-blue">
        Adres dostawy
      </p>
      <AddressFields form={form} prefix="shipping" disabled={disabled} />
    </div>
  );
}
