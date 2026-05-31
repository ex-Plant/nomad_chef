"use client";

/**
 * Admin `ui` field on the order view. The non-obvious part: regenerating a link
 * does NOT email the customer — it opens a prefilled mailto draft so the chef
 * sends the new link herself. Hidden unless the order is paid.
 */

import { useState } from "react";
import {
  Banner,
  Button,
  CopyToClipboard,
  toast,
  useDocumentInfo,
} from "@payloadcms/ui";
import type { RegenerateDownloadResponseT } from "@/types/orders";

const SUBJECT = "Twoja książka jest gotowa do pobrania";

function buildMailBody(args: {
  firstName?: string | null;
  downloadUrl: string;
  expiresAt: string;
}): string {
  const greeting = args.firstName ? `Cześć ${args.firstName},` : "Cześć,";
  const expiresLabel = new Date(args.expiresAt).toLocaleString("pl-PL", {
    dateStyle: "long",
    timeStyle: "short",
  });
  return [
    greeting,
    "",
    "Wysyłam nowy link do pobrania ebooka:",
    args.downloadUrl,
    "",
    `Link będzie aktywny do ${expiresLabel}.`,
    "",
    "Pozdrawiam,",
    "Marta",
  ].join("\n");
}

export function RegenerateDownloadButtons() {
  const { id, data } = useDocumentInfo();
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [result, setResult] = useState<RegenerateDownloadResponseT | null>(
    null,
  );

  if (!id) return null;
  if (data?.paymentStatus !== "paid") return null;

  async function run() {
    setState("loading");
    setResult(null);
    try {
      const res = await fetch(`/api/orders/${id}/regenerate-download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const body = (await res.json().catch(() => ({
        error: "Nieprawidłowa odpowiedź serwera.",
      }))) as RegenerateDownloadResponseT;
      if (!res.ok || !("token" in body)) {
        setState("error");
        setResult(body);
        return;
      }
      setState("done");
      setResult(body);
      toast.success("Wygenerowano nowy link do pobrania.");

      if (body.customerEmail && body.downloadUrl && body.expiresAt) {
        const mailto = `mailto:${encodeURIComponent(body.customerEmail)}?subject=${encodeURIComponent(SUBJECT)}&body=${encodeURIComponent(
          buildMailBody({
            firstName: body.customerFirstName,
            downloadUrl: body.downloadUrl,
            expiresAt: body.expiresAt,
          }),
        )}`;
        window.location.href = mailto;
      }
    } catch {
      setState("error");
      setResult({ error: "Network error" });
      toast.error("Błąd sieci — spróbuj ponownie.");
    }
  }

  const success = result && "token" in result ? result : undefined;
  const errorMessage = result && "error" in result ? result.error : undefined;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        marginBottom: "1.5rem",
      }}
    >
      <strong>Regeneracja linku do pobrania</strong>
      <p style={{ margin: 0, fontSize: "0.85rem", opacity: 0.7 }}>
        Tworzy nowy token i ustawia 72-godzinną ważność. Stary link przestaje
        działać. Po kliknięciu otworzy się Twój klient e-mail z gotową
        wiadomością do wysłania klientowi.
      </p>
      <div>
        <Button
          buttonStyle="primary"
          size="small"
          margin={false}
          disabled={state === "loading"}
          onClick={run}
        >
          {state === "loading" ? "…" : "Wygeneruj nowy link i otwórz e-mail"}
        </Button>
      </div>

      {state === "done" && success && (
        <Banner type="success">
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <span>Nowy link:</span>
              <code style={{ wordBreak: "break-all" }}>
                {success.downloadUrl}
              </code>
              <CopyToClipboard
                value={success.downloadUrl}
                successMessage="Skopiowano link"
              />
            </div>
            <div>
              Wygasa: {new Date(success.expiresAt).toLocaleString("pl-PL")}
            </div>
            <div style={{ opacity: 0.7 }}>
              Odśwież stronę, aby zobaczyć zaktualizowane pola.
            </div>
          </div>
        </Banner>
      )}
      {state === "done" && success && !success.customerEmail && (
        <Banner type="info">
          Brak adresu e-mail klienta — wyślij link ręcznie.
        </Banner>
      )}
      {state === "error" && (
        <Banner type="error">{errorMessage ?? "Coś poszło nie tak."}</Banner>
      )}
    </div>
  );
}
