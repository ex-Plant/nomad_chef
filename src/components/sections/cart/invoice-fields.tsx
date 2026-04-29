"use client";

import type { AnyFieldApi } from "@tanstack/react-form";
import { useStore } from "@tanstack/react-form";
import { FormTextInput, FormCheckbox } from "@/components/forms";
import { AddressFields } from "./address-fields";
import type { CartFormApiT } from "./types";

type InvoiceFieldsPropsT = {
  form: CartFormApiT;
  disabled?: boolean;
};

export function InvoiceFields({ form, disabled }: InvoiceFieldsPropsT) {
  const format = useStore(form.store, (s) => s.values.format);
  const useShippingAsInvoice = useStore(
    form.store,
    (s) => s.values.useShippingAsInvoice,
  );
  const showInvoiceAddress =
    format === "digital" || !useShippingAsInvoice;
  return (
    <div className="flex flex-col gap-3">
      <p className="font-sans text-xs uppercase tracking-wide text-off-black">
        Dane do faktury
      </p>
      <form.Field name="companyName">
        {(field: AnyFieldApi) => (
          <FormTextInput
            field={field}
            label="Nazwa firmy"
            autoComplete="organization"
            disabled={disabled}
          />
        )}
      </form.Field>
      <form.Field name="nip">
        {(field: AnyFieldApi) => (
          <FormTextInput
            field={field}
            label="NIP"
            placeholder="10 cyfr"
            inputMode="numeric"
            disabled={disabled}
            className="max-w-[12rem]"
          />
        )}
      </form.Field>
      {format === "physical" && (
        <form.Field name="useShippingAsInvoice">
          {(field: AnyFieldApi) => (
            <FormCheckbox
              field={field}
              label="Adres faktury jest taki sam jak dostawy"
              disabled={disabled}
            />
          )}
        </form.Field>
      )}
      {showInvoiceAddress && (
        <AddressFields form={form} prefix="invoice" disabled={disabled} />
      )}
    </div>
  );
}
