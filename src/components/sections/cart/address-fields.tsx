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
  const isInvoice = prefix === "invoice";
  // Country is locked to "PL" via defaultCartValues + schema postal regex.
  // Not rendered in the UI — see cart-schema.ts.
  return (
    <div className="flex flex-col gap-3">
      <input
        type="hidden"
        name={`${prefix}Country`}
        value="PL"
        autoComplete={isInvoice ? "billing country" : "shipping country"}
      />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-[3fr_1fr]">
        <form.Field name={line1Name}>
          {(field: AnyFieldApi) => (
            <FormTextInput
              field={field}
              label="Ulica i numer"
              autoComplete={
                isInvoice ? "billing address-line1" : "shipping address-line1"
              }
              disabled={disabled}
              required
            />
          )}
        </form.Field>
        <form.Field name={line2Name}>
          {(field: AnyFieldApi) => (
            <FormTextInput
              field={field}
              label="Lokal"
              placeholder="opcjonalnie"
              autoComplete={
                isInvoice ? "billing address-line2" : "shipping address-line2"
              }
              disabled={disabled}
            />
          )}
        </form.Field>
      </div>
      <div className="grid grid-cols-[3fr_1fr] gap-3">
        <form.Field name={cityName}>
          {(field: AnyFieldApi) => (
            <FormTextInput
              field={field}
              label="Miasto"
              autoComplete={
                isInvoice ? "billing address-level2" : "shipping address-level2"
              }
              disabled={disabled}
              required
            />
          )}
        </form.Field>
        <form.Field name={postalName}>
          {(field: AnyFieldApi) => (
            <FormTextInput
              field={field}
              label="Kod pocztowy"
              placeholder="00-000"
              autoComplete={
                isInvoice ? "billing postal-code" : "shipping postal-code"
              }
              disabled={disabled}
              required
            />
          )}
        </form.Field>
      </div>
    </div>
  );
}
