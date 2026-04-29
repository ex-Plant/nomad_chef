"use client";

import { useState } from "react";
import { useForm, type AnyFieldApi } from "@tanstack/react-form";
import { sendContactEmail } from "@/lib/email";
import { Button } from "@/components/shared/button";
import { FieldShell } from "@/components/sections/contact/field-shell";
import { ContactSuccessDialog } from "@/components/sections/contact/contact-success-dialog";
import { cn } from "@/helpers/cn";
import { contactFormSchema } from "../../../lib/contact-schema";

type ContactFormPropsT = {
  messagePlaceholder: string;
  submitLabel: string;
};

const inputClasses =
  "w-full rounded border border-coral bg-yellow px-4 py-2.5 font-sans text-sm text-off-black transition-colors duration-300 ease-brand placeholder:text-coral focus:bg-white focus:outline-none focus:ring-2 focus:ring-coral ";

export function ContactForm({
  messagePlaceholder,
  submitLabel,
}: ContactFormPropsT) {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorText, setErrorText] = useState<string | undefined>();

  const form = useForm({
    defaultValues: { email: "", message: "" },
    validators: { onSubmit: contactFormSchema },
    onSubmit: async ({ value }) => {
      const result = await sendContactEmail(value);
      if (result.success) {
        setStatus("success");
        setErrorText(undefined);
        form.reset();
        return;
      }
      setStatus("error");
      setErrorText(result.error);
    },
  });

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        noValidate
        className="flex flex-col gap-4"
      >
        <form.Field name="message">
          {(field) => (
            <FieldShell field={field}>
              <textarea
                placeholder={messagePlaceholder}
                aria-label={messagePlaceholder}
                rows={4}
                className={cn(inputClasses, "field-sizing-content min-h-24")}
                {...inputBindings(field)}
              />
            </FieldShell>
          )}
        </form.Field>
        <form.Field name="email">
          {(field) => (
            <FieldShell field={field}>
              <input
                type="email"
                placeholder="Twój e-mail..."
                aria-label="Twój e-mail"
                autoComplete="email"
                className={inputClasses}
                {...inputBindings(field)}
              />
            </FieldShell>
          )}
        </form.Field>

        <form.Subscribe
          selector={(s) => ({
            canSubmit: s.canSubmit,
            isSubmitting: s.isSubmitting,
          })}
        >
          {({ canSubmit, isSubmitting }) => (
            <div className=" flex flex-col gap-2">
              <Button
                type="submit"
                size="compact"
                variant="coral-solid"
                disabled={!canSubmit}
                aria-busy={isSubmitting}
              >
                {isSubmitting ? "Wysyłanie…" : submitLabel}
              </Button>
              {status === "error" && (
                <p role="alert" className="text-sm text-coral">
                  {errorText ?? "Coś poszło nie tak. Spróbuj ponownie."}
                </p>
              )}
            </div>
          )}
        </form.Subscribe>
      </form>

      <ContactSuccessDialog
        isOpen={status === "success"}
        onClose={() => setStatus("idle")}
      />
    </>
  );
}

function inputBindings(field: AnyFieldApi) {
  const hasErrors = field.state.meta.errors.length > 0;
  return {
    name: field.name,
    value: field.state.value as string,
    onBlur: field.handleBlur,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      field.handleChange(e.target.value),
    "aria-invalid": hasErrors,
    "aria-describedby": hasErrors ? `${field.name}-error` : undefined,
  } as const;
}
