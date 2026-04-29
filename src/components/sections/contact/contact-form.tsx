"use client";

import { useState } from "react";
import { useForm, type AnyFieldApi } from "@tanstack/react-form";
import { sendContactEmail } from "@/lib/email";
import { contactFormSchema } from "@/lib/contact-schema";
import { Button } from "@/components/shared/button";
import { Dialog } from "@/components/ui/dialog";
import { Starburst } from "@/components/shared/starburst";
import { ScatterText } from "@/components/shared/scatter-text";
import { cn } from "@/helpers/cn";

type ContactFormPropsT = {
  messagePlaceholder: string;
  submitLabel: string;
};

const inputClasses =
  "w-full rounded-md border border-coral bg-yellow px-4 py-2.5 font-sans text-sm text-off-black transition-colors duration-300 ease-brand placeholder:text-coral focus:bg-white focus:outline-none focus:ring-2 focus:ring-coral";

export function ContactForm({
  messagePlaceholder,
  submitLabel,
}: ContactFormPropsT) {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const form = useForm({
    defaultValues: { email: "", message: "" },
    validators: { onSubmit: contactFormSchema },
    onSubmit: async ({ value }) => {
      await sendContactEmail(value);

      try {
        setStatus("success");
        form.reset();
      } catch {
        setStatus("error");
      }
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
        className="flex flex-col gap-3"
      >
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

        <form.Field name="message">
          {(field) => (
            <FieldShell field={field}>
              <textarea
                placeholder={messagePlaceholder}
                aria-label={messagePlaceholder}
                rows={4}
                className={cn(
                  inputClasses,
                  "min-h-24 resize-none field-sizing-content"
                )}
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
            <div className="mt-1 flex flex-col gap-2">
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
                  Coś poszło nie tak. Spróbuj ponownie.
                </p>
              )}
            </div>
          )}
        </form.Subscribe>
      </form>

      <Dialog
        isOpen={status === "success"}
        onClose={() => setStatus("idle")}
        ariaLabel="Wiadomość wysłana"
        className="bg-coral"
      >
        <div className="relative flex flex-col items-center gap-6 px-6 text-center text-white">
          <Starburst
            color="pink"
            variant="logo-c"
            className="absolute -top-24 right-0 w-24 opacity-90 md:-top-32 md:w-32"
            rotate
          />
          <ScatterText
            as="h2"
            triggerOnMount
            className="text-heading-lg"
            lines={[{ text: "Dziękuję!" }]}
          />
          <p className="max-w-[320px] font-sans text-sm sm:max-w-sm sm:text-base md:max-w-lg">
            Wiadomość już do mnie leci. Odezwę się tak szybko, jak to możliwe.
          </p>
          <Button
            onClick={() => setStatus("idle")}
            variant="yellow"
            size="compact"
          >
            Zamknij
          </Button>
        </div>
      </Dialog>
    </>
  );
}

function FieldShell({
  field,
  children,
}: {
  field: AnyFieldApi;
  children: React.ReactNode;
}) {
  const errors = field.state.meta.errors;
  const hasErrors = errors.length > 0;
  const errorId = `${field.name}-error`;
  return (
    <div className="relative">
      {children}
      {hasErrors && (
        <p id={errorId} role="alert" className="mt-1 px-1 text-sm text-coral">
          {errors
            .map((e) => (typeof e === "string" ? e : (e?.message ?? "")))
            .filter(Boolean)
            .join(", ")}
        </p>
      )}
    </div>
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
