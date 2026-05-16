"use client";

import { useState } from "react";
import { useForm, type AnyFieldApi } from "@tanstack/react-form";
import {
  newsletterFormSchema,
  defaultNewsletterValues,
} from "@/lib/newsletter-schema";
import { subscribeToNewsletter } from "@/lib/newsletter";
import { Button } from "@/components/shared/button";
import { LegalLink } from "@/components/shared/legal-link";
import { FormCheckbox, FormError, FormTextInput } from "@/components/forms";
import type { SiteT } from "@/lib/get-site";

type NewsletterFormPropsT = {
  legalLinks?: SiteT["legalLinks"];
  onSuccess: () => void;
};

export function NewsletterForm({
  legalLinks,
  onSuccess,
}: NewsletterFormPropsT) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm({
    defaultValues: defaultNewsletterValues(),
    validators: { onSubmit: newsletterFormSchema },
    onSubmit: async ({ value }) => {
      setErrorMessage(null);
      const result = await subscribeToNewsletter(value.email);
      if (result.ok) {
        form.reset();
        onSuccess();
      } else {
        setErrorMessage(result.error);
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="flex flex-col gap-4"
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

      <form.Field name="acceptsPrivacy">
        {(field: AnyFieldApi) => (
          <FormCheckbox
            field={field}
            label="Akceptuję"
            trailing={
              legalLinks?.privacy && <LegalLink link={legalLinks.privacy} />
            }
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
          <div className="mt-2 flex flex-col gap-2">
            <Button
              type="submit"
              size="compact"
              variant="yellow-solid"
              disabled={!canSubmit}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? "Zapisywanie…" : "Zapisz się"}
            </Button>
            {errorMessage && <FormError>{errorMessage}</FormError>}
          </div>
        )}
      </form.Subscribe>
    </form>
  );
}
