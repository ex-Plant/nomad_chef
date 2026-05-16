"use client";

import { FormDialog } from "@/components/shared/form-dialog";
import type { SiteT } from "@/lib/get-site";
import { NewsletterForm } from "./newsletter-form";

type NewsletterDialogPropsT = {
  isOpen: boolean;
  onClose: () => void;
  legalLinks?: SiteT["legalLinks"];
  title: string;
  description: string;
};

export function NewsletterDialog({
  isOpen,
  onClose,
  legalLinks,
  title,
  description,
}: NewsletterDialogPropsT) {
  return (
    <FormDialog
      isOpen={isOpen}
      onClose={onClose}
      title={title || "Newsletter"}
      description={
        description ||
        "Podaj swój email, odezwę się gdy przygotuję coś smacznego!"
      }
    >
      <NewsletterForm legalLinks={legalLinks} onSuccess={onClose} />
    </FormDialog>
  );
}
