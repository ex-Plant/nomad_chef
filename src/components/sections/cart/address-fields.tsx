"use client";

import type { AnyFieldApi } from "@tanstack/react-form";
import { FormTextInput } from "@/components/forms";
import type { CartFormApiT } from "./types";

type AddressFieldsPropsT = {
  form: CartFormApiT;
  prefix: "shipping" | "invoice";
  disabled?: boolean;
};

export function AddressFields({ form, prefix, disabled }: AddressFieldsPropsT) {
  const line1Name = `${prefix}Line1` as const;
  const line2Name = `${prefix}Line2` as const;
  const cityName = `${prefix}City` as const;
  const postalName = `${prefix}PostalCode` as const;
  // Country is locked to "PL" via defaultCartValues + schema postal regex.
  // Not rendered in the UI — see cart-schema.ts.
  return (
    <div className="flex flex-col gap-3">
      <form.Field name={line1Name}>
        {(field: AnyFieldApi) => (
          <FormTextInput
            field={field}
            label="Ulica i numer"
            autoComplete={prefix === "shipping" ? "shipping address-line1" : "billing address-line1"}
            disabled={disabled}
          />
        )}
      </form.Field>
      <form.Field name={line2Name}>
        {(field: AnyFieldApi) => (
          <FormTextInput
            field={field}
            label="Lokal / dodatkowo"
            autoComplete={prefix === "shipping" ? "shipping address-line2" : "billing address-line2"}
            disabled={disabled}
          />
        )}
      </form.Field>
      <div className="grid grid-cols-[1fr_8rem] gap-3">
        <form.Field name={cityName}>
          {(field: AnyFieldApi) => (
            <FormTextInput
              field={field}
              label="Miasto"
              autoComplete={prefix === "shipping" ? "shipping address-level2" : "billing address-level2"}
              disabled={disabled}
            />
          )}
        </form.Field>
        <form.Field name={postalName}>
          {(field: AnyFieldApi) => (
            <FormTextInput
              field={field}
              label="Kod pocztowy"
              autoComplete={prefix === "shipping" ? "shipping postal-code" : "billing postal-code"}
              disabled={disabled}
            />
          )}
        </form.Field>
      </div>
    </div>
  );
}
