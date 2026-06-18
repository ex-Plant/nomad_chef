"use client";

import { useState } from "react";
import { Button } from "@/components/shared/button";
import { HelpDialog } from "@/components/sections/contact/help-dialog";
import { DownloadSuccessDialog } from "@/components/sections/contact/download-success-dialog";
import type { DownloadStatusT } from "@/lib/orders/download-token";

type DownloadCardPropsT = {
  token: string;
  status: DownloadStatusT;
  expiresAt: string | null;
  orderNumber: string | null;
  customerEmail: string | null;
};

const STATUS_COPY: Record<
  Exclude<DownloadStatusT, "ready" | "expired">,
  { title: string; body: string; buttonLabel: string }
> = {
  not_found: {
    title: "Link nieaktywny",
    body: "Ten link do pobrania jest nieprawidłowy lub został usunięty.",
    buttonLabel: "Mam problem z pobraniem",
  },
  not_paid: {
    title: "Zamówienie jeszcze się przetwarza",
    body: "Płatność nie została jeszcze potwierdzona. Wrócimy do Ciebie e-mailem, gdy będzie gotowe.",
    buttonLabel: "Mam problem z pobraniem",
  },
};

export function DownloadCard({
  token,
  status,
  expiresAt,
  orderNumber,
  customerEmail,
}: DownloadCardPropsT) {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const helpContext = {
    surface: "download" as const,
    status,
    token,
    ...(orderNumber ? { orderNumber } : {}),
  };

  if (status === "expired") {
    return (
      <>
        <Card>
          <Paragraph>Link nie jest już aktywny.</Paragraph>
          <div className="border-off-black/15 flex flex-col gap-6 border-t pt-6">
            <Paragraph>
              Coś nie tak z linkiem lub zamówieniem? Napisz do mnie.
            </Paragraph>
            <Button
              type="button"
              variant="coral-solid"
              size="compact"
              onClick={() => setIsHelpOpen(true)}
            >
              Mam problem z zamówieniem
            </Button>
          </div>
        </Card>
        <HelpDialog
          isOpen={isHelpOpen}
          onClose={() => setIsHelpOpen(false)}
          context={helpContext}
          prefillEmail={customerEmail ?? undefined}
        />
      </>
    );
  }

  if (status !== "ready") {
    const copy = STATUS_COPY[status];
    return (
      <>
        <Card>
          <Heading>{copy.title}</Heading>
          <Paragraph>{copy.body}</Paragraph>
          <Button
            type="button"
            variant="coral-solid"
            size="compact"
            onClick={() => setIsHelpOpen(true)}
          >
            {copy.buttonLabel}
          </Button>
        </Card>
        <HelpDialog
          isOpen={isHelpOpen}
          onClose={() => setIsHelpOpen(false)}
          context={helpContext}
          prefillEmail={customerEmail ?? undefined}
        />
      </>
    );
  }

  const expiresLabel = expiresAt
    ? new Date(expiresAt).toLocaleString("pl-PL", {
        dateStyle: "long",
        timeStyle: "short",
      })
    : null;

  return (
    <>
      <Card>
        <Heading>Twoje zamówienie jest gotowe do realizacji</Heading>
        {expiresLabel && (
          <Paragraph>
            Link będzie aktywny do <strong>{expiresLabel}</strong>.
          </Paragraph>
        )}
        <a
          href={`/api/download/${token}/file`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setIsSuccessOpen(true)}
          className="bg-electric-blue hover:bg-electric-blue/90 inline-flex items-center justify-center rounded-lg px-6 py-3 font-sans text-sm font-medium tracking-wide text-white uppercase transition-colors"
        >
          Pobierz ebook
        </a>
        <div className="border-off-black/15 flex flex-col gap-6 border-t pt-6">
          <Paragraph>
            Coś nie tak z linkiem lub zamówieniem? Napisz do mnie.
          </Paragraph>
          <Button
            type="button"
            variant="coral"
            size="compact"
            onClick={() => setIsHelpOpen(true)}
          >
            Mam problem z pobraniem
          </Button>
        </div>
      </Card>

      <DownloadSuccessDialog
        isOpen={isSuccessOpen}
        token={token}
        onConfirmed={() => setIsSuccessOpen(false)}
        onReportProblem={() => {
          setIsSuccessOpen(false);
          setIsHelpOpen(true);
        }}
      />

      <HelpDialog
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        context={helpContext}
        prefillEmail={customerEmail ?? undefined}
      />
    </>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-6">{children}</div>;
}

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="font-display text-center text-3xl tracking-tight uppercase md:text-4xl">
      {children}
    </h1>
  );
}

function Paragraph({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-center font-sans text-base leading-relaxed">
      {children}
    </p>
  );
}

