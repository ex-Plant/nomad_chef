"use client";

import { useMemo, useState } from "react";
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
} from "@/lib/cart/cart-schema";
import { createOrder } from "@/lib/orders/create-order";
import { tracksInventory } from "@/lib/products/inventory-policy";
import { Button } from "@/components/shared/button";
import { Loader } from "@/components/shared/loader";
import { LegalLink } from "@/components/shared/legal-link";
import {
  FormCheckbox,
  FormError,
  FormNumberInput,
  FormSeparator,
} from "@/components/forms";
import type { Product } from "@/payload-types";
import type { SiteT } from "@/types/site";
import { BuyerFields } from "./buyer-fields";
import { ShippingFields } from "./shipping-fields";
import { InvoiceFields } from "./invoice-fields";
import { cn } from "@/helpers/cn";

type CartFormPropsT = {
  product: Product;
  legal?: SerializedEditorState | null;
  legalLinks?: SiteT["legalLinks"];
};

export function CartForm({
  product,
  legal = null,
  legalLinks,
}: CartFormPropsT) {
  const storedValues = useCartFormStore((s) => s.formData);
  const updateFormData = useCartFormStore((s) => s.updateFormData);
  // Server-side failures from createOrder (e.g. P24 register threw) surface here.
  // TanStack's errorMap.onSubmit isn't used so a truthy success return can't be
  // mistaken for an error; mirrors the newsletter form.
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      quantity: tracksInventory(product) ? storedValues.quantity || 1 : 1,
    };
    // initialValues is captured once by useForm; we intentionally do not
    // reactively re-initialize as the user types.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  const form = useForm({
    defaultValues: initialValues,
    validators: { onSubmit: cartFormSchema },
    listeners: {
      onChange: ({ formApi }) => updateFormData(formApi.state.values),
      onChangeDebounceMs: 500,
    },
    onSubmit: async ({ value }) => {
      setErrorMessage(null);
      // On success createOrder issues a server-side redirect (303) to the P24
      // paywall and the browser navigates away, so execution only continues
      // here when it returned a failure. The redirect lives on the server
      // because a mutating action's auto-refresh otherwise raced a client-side
      // window.location handoff and made WebKit flash its native error page.
      const result = await createOrder(value);
      setErrorMessage(result.error);
    },
  });

  const wantsInvoice = useStore(form.store, (s) => s.values.wantsInvoice);
  const quantity = useStore(form.store, (s) => s.values.quantity);
  const isPhysical = product.format === "physical";
  const allowsQuantity = tracksInventory(product);
  const totalGross = allowsQuantity
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
        <form.Field name="acceptsLegal">
          {(field: AnyFieldApi) => (
            <FormCheckbox
              field={field}
              label="Akceptuję"
              ariaLabel="Akceptuję regulamin sprzedaży oraz politykę prywatności"
              trailing={
                <>
                  {legalLinks?.terms && <LegalLink link={legalLinks.terms} />}
                  {legalLinks?.terms && legalLinks?.privacy && " oraz "}
                  {legalLinks?.privacy && (
                    <LegalLink link={legalLinks.privacy} />
                  )}
                </>
              }
            />
          )}
        </form.Field>
        {!isPhysical && (
          <form.Field name="acceptsDigitalDelivery">
            {(field: AnyFieldApi) => (
              <FormCheckbox
                field={field}
                label="Wyrażam zgodę na dostarczenie treści cyfrowej przed upływem 14 dni od zawarcia umowy i przyjmuję do wiadomości utratę prawa odstąpienia od umowy."
              />
            )}
          </form.Field>
        )}
      </div>

      {wantsInvoice && <FormSeparator />}
      <div
        className={cn("flex flex-col gap-3", wantsInvoice ? "mt-0" : "mt-2")}
      >
        <form.Field name="wantsInvoice">
          {(field: AnyFieldApi) => (
            <FormCheckbox field={field} label="Faktura" />
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
            {isSubmitting && (
              <Loader className="fixed inset-0 z-50 bg-transparent" />
            )}
            {allowsQuantity && (
              <form.Field name="quantity">
                {(field: AnyFieldApi) => (
                  <FormNumberInput
                    field={field}
                    label="Ilość"
                    min={1}
                    max={99}
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
            {errorMessage && <FormError>{errorMessage}</FormError>}
            <Button
              type="submit"
              size="compact"
              variant="blue-solid"
              disabled={!canSubmit}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? "Wysyłanie…" : "Złóż zamówienie"}
            </Button>
            {/* <div className="flex items-start justify-between gap-4 pt-4">
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
            </div> */}
          </div>
        )}
      </form.Subscribe>
    </form>
  );
}
