"use client";

import { useMemo } from "react";
import Link from "next/link";
import NextImage from "next/image";
import p24Logo from "@/assets/przelewy24-logo.png";
import { RichText } from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import { useForm, useStore, type AnyFieldApi } from "@tanstack/react-form";
import { useCartFormStore } from "@/stores/cart-form-store";
import {
  cartFormSchema,
  defaultCartValues,
  type CartFormValuesT,
} from "@/lib/cart-schema";
import { createOrder } from "@/lib/orders/create-order";
import { Button } from "@/components/shared/button";
import {
  FormCheckbox,
  FormError,
  FormSeparator,
  FormTextInput,
} from "@/components/forms";
import type { Product } from "@/payload-types";
import type { SiteT } from "@/lib/get-site";
import { LEGAL_SLUGS } from "@/config/legal";
import { BuyerFields } from "./buyer-fields";
import { ShippingFields } from "./shipping-fields";
import { InvoiceFields } from "./invoice-fields";
import { cn } from "@/helpers/cn";

type CartFormPropsT = {
  product: Product;
  legal?: SerializedEditorState | null;
  legalLinks?: SiteT["legalLinks"];
  onSuccess: (orderNumber: string, email: string) => void;
};

export function CartForm({
  product,
  legal = null,
  legalLinks,
  onSuccess,
}: CartFormPropsT) {
  const storedValues = useCartFormStore((s) => s.formData);
  const updateFormData = useCartFormStore((s) => s.updateFormData);
  const resetFormData = useCartFormStore((s) => s.resetFormData);

  const initialValues = useMemo<CartFormValuesT>(() => {
    const defaults = defaultCartValues(
      product.format as "digital" | "physical",
      product.slug,
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
  const quantity = useStore(form.store, (s) => s.values.quantity);
  const isPhysical = product.format === "physical";
  const totalGross = isPhysical
    ? product.priceGross * Math.max(1, quantity || 1)
    : product.priceGross;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      noValidate
      className="relative flex flex-col"
    >
      <BuyerFields form={form} />
      {isPhysical && (
        <>
          <FormSeparator />
          <ShippingFields form={form} />
        </>
      )}
      <div className="mt-2 flex flex-col gap-2">
        <form.Field name="acceptsTerms">
          {(field: AnyFieldApi) => (
            <FormCheckbox
              className={``}
              field={field}
              label="Akceptuję"
              trailing={
                <Link
                  href={legalLinks?.terms?.href ?? `/${LEGAL_SLUGS.terms}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-yellow underline underline-offset-3"
                >
                  {legalLinks?.terms?.label ?? "regulamin sprzedaży"}
                </Link>
              }
            />
          )}
        </form.Field>
        <form.Field name="acceptsPrivacy">
          {(field: AnyFieldApi) => (
            <FormCheckbox
              field={field}
              label="Akceptuję"
              trailing={
                <Link
                  href={legalLinks?.privacy?.href ?? `/${LEGAL_SLUGS.privacy}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-yellow underline underline-offset-3"
                >
                  {legalLinks?.privacy?.label ?? "politykę prywatności"}
                </Link>
              }
            />
          )}
        </form.Field>
      </div>

      {wantsInvoice && <FormSeparator className={``} />}
      <div
        className={cn("flex flex-col gap-3", wantsInvoice ? "mt-0" : "mt-2")}
      >
        <form.Field name="wantsInvoice">
          {(field: AnyFieldApi) => (
            <FormCheckbox field={field} label="Chcę fakturę VAT" />
          )}
        </form.Field>
        {wantsInvoice && <InvoiceFields form={form} />}
      </div>

      <FormSeparator />

      <form.Subscribe
        selector={(s) => ({
          canSubmit: s.canSubmit,
          isSubmitting: s.isSubmitting,
          hasFieldErrors: Object.values(s.fieldMeta).some(
            (meta) => meta.errors.length > 0,
          ),
          attempted: s.submissionAttempts > 0,
        })}
      >
        {({ canSubmit, isSubmitting, hasFieldErrors, attempted }) => (
          <div className="flex flex-col gap-3">
            {isPhysical && (
              <form.Field name="quantity">
                {(field: AnyFieldApi) => (
                  <FormTextInput
                    field={field}
                    label="Ilość"
                    type="number"
                    inputMode="numeric"
                    className="max-w-20"
                  />
                )}
              </form.Field>
            )}
            <div className="flex items-baseline justify-between">
              <span className="text-off-black font-sans text-sm font-medium tracking-wide uppercase">
                Do zapłaty
              </span>
              <span className="font-display text-off-black text-2xl">
                {totalGross} PLN
              </span>
            </div>

            {attempted && hasFieldErrors && (
              <FormError>Koszyk zawiera błędy</FormError>
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
            <div className="flex items-start justify-between gap-4 pt-4">
              {legal ? (
                <address className="[&_a]:hover:text-yellow font-sans text-xs leading-snug text-white/85 not-italic [&_a]:underline [&_a]:underline-offset-2 [&_p]:m-0">
                  <RichText data={legal} />
                </address>
              ) : (
                <span />
              )}
              <NextImage
                src={p24Logo}
                alt="Przelewy24"
                sizes="120px"
                className="h-8 w-auto shrink-0"
                placeholder="blur"
              />
            </div>
          </div>
        )}
      </form.Subscribe>
    </form>
  );
}
