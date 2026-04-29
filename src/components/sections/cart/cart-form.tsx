"use client";

import { useMemo } from "react";
import { useForm, useStore, type AnyFieldApi } from "@tanstack/react-form";
import { useCartFormStore } from "@/stores/form-stores";
import {
  cartFormSchema,
  defaultCartValues,
  type CartFormValuesT,
} from "@/lib/cart-schema";
import { createOrder } from "@/lib/orders";
import { Button } from "@/components/shared/button";
import { FormCheckbox, FormTextarea } from "@/components/forms";
import type { Product } from "@/payload-types";
import { BuyerFields } from "./buyer-fields";
import { ShippingFields } from "./shipping-fields";
import { InvoiceFields } from "./invoice-fields";
import { Starburst } from "../../shared/starburst";

type CartFormPropsT = {
  product: Product;
  onSuccess: (orderNumber: string, email: string) => void;
};

export function CartForm({ product, onSuccess }: CartFormPropsT) {
  const storedValues = useCartFormStore((s) => s.formData);
  const updateFormData = useCartFormStore((s) => s.updateFormData);
  const resetFormData = useCartFormStore((s) => s.resetFormData);

  const initialValues = useMemo<CartFormValuesT>(() => {
    const defaults = defaultCartValues(
      product.format as "digital" | "physical",
      product.slug
    );
    if (!storedValues) return defaults;
    return {
      ...storedValues,
      format: defaults.format,
      productSlug: defaults.productSlug,
      quantity: defaults.format === "physical" ? storedValues.quantity || 1 : 1,
    };
    // initialValues is captured once by useForm; we intentionally do not
    // reactively re-initialize as the user types.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  const form = useForm({
    defaultValues: initialValues,
    validators: { onSubmit: cartFormSchema },
    listeners: {
      onChange: ({ formApi }) =>
        updateFormData(formApi.state.values as CartFormValuesT),
      onChangeDebounceMs: 500,
    },
    onSubmit: async ({ value }) => {
      const result = await createOrder(value);
      if (result.ok) {
        resetFormData();
        form.reset();
        onSuccess(result.orderNumber, value.email);
      }
      return result;
    },
  });

  const wantsInvoice = useStore(form.store, (s) => s.values.wantsInvoice);
  const isPhysical = product.format === "physical";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      noValidate
      className="flex flex-col gap-5 relative "
    >
      <header className="flex flex-col gap-1 text-electric-blue">
        <h3 className="font-display text-2xl">{product.title}</h3>
      </header>

      <BuyerFields form={form} />
      {isPhysical && <ShippingFields form={form} />}
      <form.Field name="wantsInvoice">
        {(field: AnyFieldApi) => (
          <FormCheckbox field={field} label="Chcę fakturę VAT" />
        )}
      </form.Field>
      {wantsInvoice && <InvoiceFields form={form} />}

      <form.Field name="notes">
        {(field: AnyFieldApi) => (
          <FormTextarea
            field={field}
            label="Wiadomość (opcjonalnie)"
            rows={3}
          />
        )}
      </form.Field>

      <form.Subscribe
        selector={(s) => ({
          canSubmit: s.canSubmit,
          isSubmitting: s.isSubmitting,
          hasFieldErrors: Object.values(s.fieldMeta).some(
            (meta) => meta.errors.length > 0
          ),
          attempted: s.submissionAttempts > 0,
        })}
      >
        {({ canSubmit, isSubmitting, hasFieldErrors, attempted }) => (
          <div className="flex flex-col gap-3 pt-4">
            <div className="flex items-baseline justify-between border-t border-coral/20 pt-3">
              <span className="font-sans text-xs uppercase tracking-wide text-off-black">
                Do zapłaty
              </span>
              <span className="font-display text-2xl text-off-black">
                {product.priceGross} PLN
              </span>
            </div>
            {attempted && hasFieldErrors && (
              <p role="alert" className="rounded-md py-2 text-sm text-error">
                Koszyk zawiera błędy
              </p>
            )}
            <Button
              type="submit"
              size="compact"
              variant="blue-solid"
              disabled={!canSubmit}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? "Wysyłanie…" : "Złóż zamówienie"}
            </Button>
          </div>
        )}
      </form.Subscribe>
    </form>
  );
}
