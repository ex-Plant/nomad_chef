"use client";

import { FormDialog } from "@/components/shared/form-dialog";
import { HelpForm } from "./help-form";
import type { ContactContextT } from "@/lib/email";

type HelpDialogPropsT = {
  isOpen: boolean;
  onClose: () => void;
  context: ContactContextT;
  prefillEmail?: string;
};

const SURFACE_COPY: Record<
  ContactContextT["surface"],
  { title: string; description: string }
> = {
  download: {
    title: "Problem z pobraniem",
    description:
      "Napisz, co się stało. Wyślemy nowy link lub plik bezpośrednio na Twój e-mail.",
  },
  checkout: {
    title: "Problem z płatnością",
    description:
      "Opisz, co poszło nie tak. Sprawdzimy zamówienie i odezwiemy się indywidualnie.",
  },
};

export function HelpDialog({
  isOpen,
  onClose,
  context,
  prefillEmail,
}: HelpDialogPropsT) {
  const copy = SURFACE_COPY[context.surface];
  return (
    <FormDialog
      isOpen={isOpen}
      onClose={onClose}
      title={copy.title}
      description={copy.description}
    >
      <HelpForm context={context} prefillEmail={prefillEmail} />
    </FormDialog>
  );
}
