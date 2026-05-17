"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/shared/button";
import type { DownloadStatusT } from "@/lib/orders/download-token";

type ResendStateT = "idle" | "loading" | "sent" | "error";

type DownloadCardPropsT = {
  token: string;
  status: DownloadStatusT;
  attemptsRemaining: number;
  downloadLimit: number;
  productTitle: string | null;
};

export function DownloadCard({
  token,
  status,
  attemptsRemaining,
  downloadLimit,
  productTitle,
}: DownloadCardPropsT) {
  const [resendState, setResendState] = useState<ResendStateT>("idle");

  async function resend() {
    if (resendState === "loading" || resendState === "sent") return;
    setResendState("loading");
    try {
      const res = await fetch(`/api/download/${token}/resend`, {
        method: "POST",
      });
      setResendState(res.ok ? "sent" : "error");
    } catch {
      setResendState("error");
    }
  }

  if (status === "not_found") {
    return (
      <Card>
        <Heading>Link nieaktywny</Heading>
        <Paragraph>
          Ten link do pobrania jest nieprawidłowy lub został usunięty. Jeśli
          uważasz, że to błąd, napisz do nas.
        </Paragraph>
      </Card>
    );
  }

  if (status === "not_paid") {
    return (
      <Card>
        <Heading>Zamówienie jeszcze się przetwarza</Heading>
        <Paragraph>
          Płatność nie została jeszcze potwierdzona. Wrócimy do Ciebie e-mailem,
          gdy będzie gotowe.
        </Paragraph>
        <Link
          href="/checkout/processing"
          className="font-sans text-sm underline underline-offset-4"
        >
          Wróć do statusu zamówienia
        </Link>
      </Card>
    );
  }

  if (status === "expired") {
    return (
      <Card>
        <Heading>Link wygasł</Heading>
        <Paragraph>
          Ten link do pobrania już nie działa. Kliknij poniżej, a wyślemy świeży
          link na Twój e-mail.
        </Paragraph>
        <ResendButton state={resendState} onClick={resend} />
      </Card>
    );
  }

  if (status === "exhausted") {
    return (
      <Card>
        <Heading>Limit pobrań wykorzystany</Heading>
        <Paragraph>
          Wykorzystałaś/eś wszystkie próby pobrania. Kliknij poniżej, a
          przygotujemy nowy link.
        </Paragraph>
        <ResendButton state={resendState} onClick={resend} />
      </Card>
    );
  }

  return (
    <Card>
      <Heading>Twój ebook jest gotowy</Heading>
      {productTitle && (
        <p className="font-display text-coral text-xl tracking-tight uppercase">
          {productTitle}
        </p>
      )}
      <Paragraph>
        Kliknij przycisk, aby pobrać plik. Pozostało Ci{" "}
        <strong>
          {attemptsRemaining} z {downloadLimit}
        </strong>{" "}
        prób.
      </Paragraph>
      <a
        href={`/api/download/${token}/file`}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-electric-blue hover:bg-electric-blue/90 inline-flex items-center justify-center rounded-lg px-6 py-3 font-sans text-sm font-medium tracking-wide text-white uppercase transition-colors"
      >
        Pobierz ebook
      </a>
      <div className="border-off-black/15 mt-4 flex flex-col gap-3 border-t pt-6">
        <Paragraph>
          Coś poszło nie tak z pobieraniem? Możesz poprosić o ponowne wysłanie
          linku e-mailem.
        </Paragraph>
        <ResendButton state={resendState} onClick={resend} />
      </div>
    </Card>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-4">{children}</div>;
}

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="font-display text-3xl tracking-tight uppercase md:text-4xl">
      {children}
    </h1>
  );
}

function Paragraph({ children }: { children: React.ReactNode }) {
  return <p className="font-sans text-base leading-relaxed">{children}</p>;
}

type ResendButtonPropsT = {
  state: ResendStateT;
  onClick: () => void;
};

function ResendButton({ state, onClick }: ResendButtonPropsT) {
  const label =
    state === "loading"
      ? "Wysyłam…"
      : state === "sent"
        ? "Wysłaliśmy nowy link"
        : "Wyślij link ponownie";

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant="coral-solid"
        size="compact"
        onClick={onClick}
        disabled={state === "loading" || state === "sent"}
        aria-busy={state === "loading"}
      >
        {label}
      </Button>
      {state === "error" && (
        <p className="font-sans text-sm text-red-700">
          Nie udało się wysłać. Spróbuj za chwilę.
        </p>
      )}
    </div>
  );
}
