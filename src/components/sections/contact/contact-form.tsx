"use client";

import { useState } from "react";
import { useForm, type AnyFieldApi } from "@tanstack/react-form";
import { sendContactEmail } from "@/lib/email";
import { contactFormSchema } from "@/lib/contact-schema";
import { FormTextInput, FormTextarea } from "@/components/forms";
import { Button } from "@/components/shared/button";
import { Dialog } from "@/components/ui/dialog";
import { Starburst } from "@/components/shared/starburst";
import { ScatterText } from "@/components/shared/scatter-text";

type ContactFormPropsT = {
  messagePlaceholder: string;
  submitLabel: string;
};

export function ContactForm({
  messagePlaceholder,
  submitLabel,
}: ContactFormPropsT) {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const form = useForm({
    defaultValues: { email: "", message: "" },
    validators: { onSubmit: contactFormSchema },
    onSubmit: async ({ value }) => {
      try {
        await sendContactEmail(value);
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
          {(field: AnyFieldApi) => (
            <FormTextInput
              field={field}
              type="email"
              placeholder="Twój e-mail..."
              autoComplete="email"
            />
          )}
        </form.Field>
        <form.Field name="message">
          {(field: AnyFieldApi) => (
            <FormTextarea field={field} placeholder={messagePlaceholder} rows={4} />
          )}
        </form.Field>
        <form.Subscribe
          selector={(s) => ({ canSubmit: s.canSubmit, isSubmitting: s.isSubmitting })}
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
