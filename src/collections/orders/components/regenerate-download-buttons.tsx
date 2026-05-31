"use client";

/**
 * Admin-only `ui` field rendered on the order edit view (mounted in
 * collections/orders/index.ts). Calls POST /api/orders/:id/regenerate-download to
 * mint a fresh download link, then opens a prefilled mailto draft so the chef can
 * send the new link to the customer manually. Renders nothing unless the order is
 * paid.
 */

import { useState } from "react";
import { useDocumentInfo } from "@payloadcms/ui";

type ResultT = {
  token?: string;
  expiresAt?: string;
  downloadUrl?: string;
  customerEmail?: string | null;
  customerFirstName?: string | null;
  error?: string;
};

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
  const [result, setResult] = useState<ResultT | null>(null);

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
      const body = (await res.json().catch(() => ({}))) as ResultT;
      if (!res.ok) {
        setState("error");
        setResult(body);
        return;
      }
      setState("done");
      setResult(body);

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
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        padding: "1rem",
        border: "1px solid var(--theme-elevation-150)",
        borderRadius: "4px",
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
        <button
          type="button"
          className="btn btn--style-primary btn--size-small"
          disabled={state === "loading"}
          onClick={run}
        >
          {state === "loading" ? "…" : "Wygeneruj nowy link i otwórz e-mail"}
        </button>
      </div>

      {state === "done" && result?.token && (
        <div style={{ fontSize: "0.85rem" }}>
          <div>
            Nowy link:{" "}
            <code style={{ wordBreak: "break-all" }}>{result.downloadUrl}</code>
          </div>
          <div>
            Wygasa:{" "}
            {result.expiresAt
              ? new Date(result.expiresAt).toLocaleString("pl-PL")
              : "—"}
          </div>
          {!result.customerEmail && (
            <div style={{ color: "var(--theme-warning-500)" }}>
              Brak adresu e-mail klienta — wyślij link ręcznie.
            </div>
          )}
          <div style={{ marginTop: "0.5rem", opacity: 0.7 }}>
            Odśwież stronę, aby zobaczyć zaktualizowane pola.
          </div>
        </div>
      )}
      {state === "error" && (
        <div style={{ color: "var(--theme-error-500)", fontSize: "0.85rem" }}>
          {result?.error ?? "Coś poszło nie tak."}
        </div>
      )}
    </div>
  );
}
