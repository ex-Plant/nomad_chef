/**
 * The visible UI of the download page. Pure rendering + the small bit of
 * interactive state for the "resend" button.
 *
 * Why a client component when the parent is a server component?
 * Because we need:
 *   - `useState` for the resend button's local lifecycle
 *   - a click handler that calls `/api/download/<token>/resend`
 * Server components can't do either. Splitting it lets the heavy data
 * resolution stay on the server while only the small interactive widget
 * ships JS to the browser.
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/shared/button";

// Mirror of the server-side resolver in page.tsx. Exported so the parent
// page imports the same string-union type.
export type DownloadStatusT =
  | "ready"
  | "expired"
  | "exhausted"
  | "not_paid"
  | "not_found";

type DownloadCardPropsT = {
  token: string;
  status: DownloadStatusT;
  attemptsRemaining: number;
  productTitle: string | null;
};

export function DownloadCard({
  token,
  status,
  attemptsRemaining,
  productTitle,
}: DownloadCardPropsT) {
  // Resend button lifecycle: idle → loading → (sent | error).
  // We stay on `sent` once we succeed so the user can't spam the endpoint.
  const [resendState, setResendState] = useState<
    "idle" | "loading" | "sent" | "error"
  >("idle");

  async function resend() {
    // Guard against double-click during a request and against a re-send
    // after success.
    if (resendState === "loading" || resendState === "sent") return;
    setResendState("loading");
    try {
      const res = await fetch(`/api/download/${token}/resend`, {
        method: "POST",
      });
      // The resend endpoint ALWAYS returns 200 ok (it doesn't leak whether
      // the token exists), so this branch is mostly defensive — true
      // failures here mean network or 5xx.
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
        <strong>{attemptsRemaining} z 5</strong> prób.
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
  state: "idle" | "loading" | "sent" | "error";
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
