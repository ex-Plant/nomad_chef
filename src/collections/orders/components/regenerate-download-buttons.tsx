"use client";

import { useState } from "react";
import { useDocumentInfo } from "@payloadcms/ui";

type ResultT = {
  token?: string;
  expiresAt?: string;
  emailed?: boolean;
  error?: string;
};

export function RegenerateDownloadButtons() {
  const { id, data } = useDocumentInfo();
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [result, setResult] = useState<ResultT | null>(null);

  if (!id) return null;
  // Field-level admin.condition (whenDigitalOrder) already filters by format,
  // so here we only gate on payment status.
  if (data?.paymentStatus !== "paid") return null;

  async function run(sendEmail: boolean) {
    setState("loading");
    setResult(null);
    try {
      const res = await fetch(`/api/orders/${id}/regenerate-download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sendEmail }),
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
        Tworzy nowy token i ustawia 24-godzinną ważność. Stary link przestaje
        działać.
      </p>
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <button
          type="button"
          className="btn btn--style-secondary btn--size-small"
          disabled={state === "loading"}
          onClick={() => run(false)}
        >
          {state === "loading" ? "…" : "Wygeneruj nowy link"}
        </button>
        <button
          type="button"
          className="btn btn--style-primary btn--size-small"
          disabled={state === "loading"}
          onClick={() => run(true)}
        >
          {state === "loading" ? "…" : "Wygeneruj i wyślij"}
        </button>
      </div>

      {state === "done" && result?.token && (
        <div style={{ fontSize: "0.85rem" }}>
          <div>
            Nowy link:{" "}
            <code style={{ wordBreak: "break-all" }}>
              {window.location.origin}/download/{result.token}
            </code>
          </div>
          <div>
            Wygasa:{" "}
            {result.expiresAt
              ? new Date(result.expiresAt).toLocaleString("pl-PL")
              : "—"}
          </div>
          <div>
            {result.emailed ? "E-mail wysłany." : "E-mail nie wysłany."}
          </div>
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
