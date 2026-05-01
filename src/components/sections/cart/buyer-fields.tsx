"use client";

import type { AnyFieldApi } from "@tanstack/react-form";
import { FormTextInput, FormTextarea } from "@/components/forms";
import type { CartFormApiT } from "./types";

type BuyerFieldsPropsT = {
  form: CartFormApiT;
  disabled?: boolean;
};

export function BuyerFields({ form, disabled }: BuyerFieldsPropsT) {
  return (
    <div className="flex flex-col gap-3">
      <form.Field name="email">
        {(field: AnyFieldApi) => (
          <FormTextInput
            field={field}
            label="E-mail"
            type="email"
            autoComplete="email"
            placeholder="Twój e-mail"
            disabled={disabled}
            required
          />
        )}
      </form.Field>
      <div className="grid grid-cols-2 gap-3">
        <form.Field name="firstName">
          {(field: AnyFieldApi) => (
            <FormTextInput
              field={field}
              label="Imię"
              autoComplete="given-name"
              placeholder="Twoje imię"
              disabled={disabled}
            />
          )}
        </form.Field>
        <form.Field name="lastName">
          {(field: AnyFieldApi) => (
            <FormTextInput
              field={field}
              label="Nazwisko"
              autoComplete="family-name"
              placeholder="Twoje nazwisko"
              disabled={disabled}
            />
          )}
        </form.Field>
      </div>
      <form.Field name="notes">
        {(field: AnyFieldApi) => (
          <FormTextarea
            field={field}
            label="Wiadomość"
            rows={3}
            placeholder="Uwagi do zamówienia"
            disabled={disabled}
          />
        )}
      </form.Field>
    </div>
  );
}
