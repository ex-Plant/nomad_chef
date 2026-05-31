"use client";

/**
 * Admin `ui` field on the order view. Replaces the old automatic physicalShipped
 * hook: the chef marks the order shipped and saves, then clicks here to send the
 * "your book is on the way" email. Hidden unless the order is physical and its
 * fulfillmentStatus is already "shipped". The button stays disabled until a
 * tracking number is saved, because the email includes it.
 */

import { useState } from "react";
import { Banner, Button, toast, useDocumentInfo } from "@payloadcms/ui";
import type { SendShipmentNotificationResponseT } from "@/types/orders";

export function SendShipmentButton() {
  const { id, data } = useDocumentInfo();
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [result, setResult] =
    useState<SendShipmentNotificationResponseT | null>(null);

  if (!id) return null;
  if (data?.fulfillmentStatus !== "shipped") return null;

  const hasTracking = Boolean((data?.tracking as string | undefined)?.trim());

  async function run() {
    setState("loading");
    setResult(null);
    try {
      const res = await fetch(`/api/orders/${id}/send-shipment-notification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const body = (await res.json().catch(() => ({
        error: "Nieprawidłowa odpowiedź serwera.",
      }))) as SendShipmentNotificationResponseT;
      if (!res.ok || !("sentTo" in body)) {
        setState("error");
        setResult(body);
        toast.error("error" in body ? body.error : "Nie udało się wysłać.");
        return;
      }
      setState("done");
      setResult(body);
      toast.success(`Powiadomienie wysłane do ${body.sentTo}.`);
    } catch {
      setState("error");
      setResult({ error: "Błąd sieci — spróbuj ponownie." });
      toast.error("Błąd sieci — spróbuj ponownie.");
    }
  }

  const success = result && "sentTo" in result ? result : undefined;
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
      <strong>Powiadomienie o wysyłce</strong>
      <p style={{ margin: 0, fontSize: "0.85rem", opacity: 0.7 }}>
        Wysyła klientowi e-mail z numerem przesyłki. Nie wysyła się
        automatycznie — kliknij, gdy paczka jest w drodze.
      </p>
      <div>
        <Button
          buttonStyle="primary"
          size="small"
          margin={false}
          disabled={state === "loading" || !hasTracking}
          onClick={run}
        >
          {state === "loading" ? "…" : "Wyślij powiadomienie o wysyłce"}
        </Button>
      </div>

      {!hasTracking && (
        <Banner type="info">
          Uzupełnij i zapisz numer przesyłki, aby wysłać powiadomienie.
        </Banner>
      )}
      {state === "done" && success && (
        <Banner type="success">
          Powiadomienie wysłane do {success.sentTo}.
        </Banner>
      )}
      {state === "error" && (
        <Banner type="error">{errorMessage ?? "Coś poszło nie tak."}</Banner>
      )}
    </div>
  );
}
