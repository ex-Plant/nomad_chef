"use client";

import { useState } from "react";
import { useForm, type AnyFieldApi } from "@tanstack/react-form";
import { sendContactEmail } from "@/lib/email";
import { contactFormSchema } from "@/lib/contact-schema";
import { FormTextInput, FormTextarea } from "@/components/forms";
import { Button } from "@/components/shared/button";
import { SuccessDialog } from "@/components/shared/success-dialog";
import { NewsletterDialog } from "./newsletter-dialog";
import type { SiteT } from "@/types/site";

type ContactFormPropsT = {
  messagePlaceholder: string;
  submitLabel: string;
  legalLinks?: SiteT["legalLinks"];
  newsletter: SiteT["contact"]["newsletter"];
};

export function ContactForm({
  messagePlaceholder,
  submitLabel,
  legalLinks,
  newsletter,
}: ContactFormPropsT) {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [isNewsletterOpen, setIsNewsletterOpen] = useState(false);

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
        aria-label="Wyślij wiadomość"
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
                variant="coral-solid"
                disabled={!canSubmit}
                aria-busy={isSubmitting}
              >
                {isSubmitting ? "Wysyłanie…" : submitLabel}
              </Button>
              <Button
                type="button"
                size="compact"
                variant="coral"
                onClick={() => setIsNewsletterOpen(true)}
              >
                Zapisz się do newslettera
              </Button>
              {status === "error" && (
                <p role="alert" className="text-coral text-sm">
                  Coś poszło nie tak. Spróbuj ponownie.
                </p>
              )}
            </div>
          )}
        </form.Subscribe>
      </form>

      <NewsletterDialog
        isOpen={isNewsletterOpen}
        onClose={() => setIsNewsletterOpen(false)}
        legalLinks={legalLinks}
        title={newsletter.title}
        description={newsletter.description}
      />

      <SuccessDialog
        isOpen={status === "success"}
        onClose={() => setStatus("idle")}
        ariaLabel="Wiadomość wysłana"
        title="Dziękuję!"
        body="Wiadomość już do mnie leci. Odezwę się wkrótce."
      />
    </>
  );
}
