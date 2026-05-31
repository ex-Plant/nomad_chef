"use client";

import { useState } from "react";
import { useForm, type AnyFieldApi } from "@tanstack/react-form";
import {
  sendContactEmail,
  type ContactContextT,
} from "@/lib/contact/send-contact-email";
import { contactFormSchema } from "@/lib/contact/contact-schema";
import { FormTextInput, FormTextarea } from "@/components/forms";
import { Button } from "@/components/shared/button";

type HelpFormPropsT = {
  prefillEmail?: string;
  messagePlaceholder?: string;
  submitLabel?: string;
  context: ContactContextT;
};

export function HelpForm({
  prefillEmail = "",
  messagePlaceholder = "Opisz problem…",
  submitLabel = "Wyślij wiadomość",
  context,
}: HelpFormPropsT) {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const form = useForm({
    defaultValues: { email: prefillEmail, message: "" },
    validators: { onSubmit: contactFormSchema },
    onSubmit: async ({ value }) => {
      try {
        await sendContactEmail(value, context);
        setStatus("success");
        form.reset();
      } catch {
        setStatus("error");
      }
    },
  });

  if (status === "success") {
    return (
      <p className="font-sans text-base leading-relaxed text-white">
        Dziękujemy — odezwiemy się indywidualnie na podany e-mail.
      </p>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      noValidate
      aria-label="Formularz pomocy"
      className="flex flex-col gap-3"
    >
      <form.Field name="email">
        {(field: AnyFieldApi) => (
          <FormTextInput
            field={field}
            type="email"
            placeholder="Twój e-mail..."
            autoComplete="email"
            className="bg-yellow border-coral focus:ring-coral border ring-0 focus:bg-white focus:ring-2"
          />
        )}
      </form.Field>
      <form.Field name="message">
        {(field: AnyFieldApi) => (
          <FormTextarea
            field={field}
            placeholder={messagePlaceholder}
            rows={4}
            className="bg-yellow border-coral focus:ring-coral border ring-0 focus:bg-white focus:ring-2"
          />
        )}
      </form.Field>
      <form.Subscribe
        selector={(s) => ({
          canSubmit: s.canSubmit,
          isSubmitting: s.isSubmitting,
        })}
      >
        {({ canSubmit, isSubmitting }) => (
          <div className="mt-1 flex flex-col gap-2">
            <Button
              type="submit"
              size="compact"
              variant="yellow-solid"
              disabled={!canSubmit}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? "Wysyłanie…" : submitLabel}
            </Button>
            {status === "error" && (
              <p role="alert" className="text-yellow text-sm">
                Coś poszło nie tak. Spróbuj ponownie.
              </p>
            )}
          </div>
        )}
      </form.Subscribe>
    </form>
  );
}
