"use client";

import { useState } from "react";
import { FormDialog } from "@/components/shared/form-dialog";
import { Button } from "@/components/shared/button";

type DownloadSuccessDialogPropsT = {
  isOpen: boolean;
  token: string;
  onConfirmed: () => void;
  onReportProblem: () => void;
};

export function DownloadSuccessDialog({
  isOpen,
  token,
  onConfirmed,
  onReportProblem,
}: DownloadSuccessDialogPropsT) {
  const [state, setState] = useState<"idle" | "loading">("idle");

  async function confirm() {
    setState("loading");
    try {
      await fetch(`/api/download/${token}/confirm-delivery`, {
        method: "POST",
      });
    } catch {
      // endpoint always returns 200; even if network blips, treat as confirmed
    }
    setState("idle");
    onConfirmed();
  }

  return (
    <FormDialog
      isOpen={isOpen}
      onClose={onConfirmed}
      title="Czy plik pobrał się poprawnie?"
      description="Daj nam znać — wpływa to na status Twojego zamówienia."
    >
      <div className="flex flex-col gap-3">
        <Button
          type="button"
          variant="coral-solid"
          size="compact"
          disabled={state === "loading"}
          aria-busy={state === "loading"}
          onClick={confirm}
        >
          {state === "loading" ? "Zapisuję…" : "Tak, dziękuję"}
        </Button>
        <Button
          type="button"
          variant="coral"
          size="compact"
          onClick={onReportProblem}
        >
          Mam problem z pobraniem
        </Button>
      </div>
    </FormDialog>
  );
}
