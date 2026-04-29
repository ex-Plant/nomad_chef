"use client";

import type { AnyFieldApi } from "@tanstack/react-form";
import { FormTextInput } from "@/components/forms";
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
      <form.Field name="quantity">
        {(field: AnyFieldApi) => (
          <FormTextInput
            field={field}
            label="Ilość"
            type="number"
            inputMode="numeric"
            disabled={disabled}
            className="max-w-[8rem]"
          />
        )}
      </form.Field>
      <AddressFields form={form} prefix="shipping" disabled={disabled} />
    </div>
  );
}
