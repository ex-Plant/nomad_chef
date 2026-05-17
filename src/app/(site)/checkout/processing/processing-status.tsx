/**
 * Client component that lives inside the processing page.
 *
 * It does two things:
 *   1. Polls /api/checkout/status every 2 seconds. As soon as the server
 *      reports `paymentStatus: "paid"` AND a `downloadToken`, it hard-
 *      navigates the browser to /download/<token>.
 *   2. In dev only, renders a "Simulate payment" button that POSTs to
 *      /api/dev/mark-paid. That route flips the order to paid, which fires
 *      the digital-fulfillment hook, which generates the token, which the
 *      next poll picks up — full local end-to-end without Stripe.
 *
 * WHY POLLING INSTEAD OF SSE / WEBSOCKETS?
 * Simplest thing that works. The wait window is short (seconds-to-minutes),
 * Vercel functions are cheap, and a real implementation would replace this
 * with a redirect from the Stripe success URL anyway.
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shared/button";
import { Loader } from "@/components/shared/loader";

// Mirror of what /api/checkout/status returns.
type StatusResponseT = {
  orderNumber: string;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  downloadToken: string | null;
};

type ProcessingStatusPropsT = {
  orderNumber: string;
  isDev: boolean;
};

// 2s feels responsive without hammering the server.
const POLL_INTERVAL_MS = 2000;

export function ProcessingStatus({
  orderNumber,
  isDev,
}: ProcessingStatusPropsT) {
  const router = useRouter();
  const [paymentStatus, setPaymentStatus] = useState<StatusResponseT["paymentStatus"]>("pending");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulateError, setSimulateError] = useState<string | null>(null);

  useEffect(() => {
    // `cancelled` protects against React strict-mode double-invocation
    // and against the component unmounting mid-fetch. If we navigated
    // away, a late response shouldn't call setState on a dead component.
    let cancelled = false;

    async function poll() {
      try {
        // `cache: "no-store"` ensures every request actually hits the
        // network and we don't get a stale cached response.
        const res = await fetch("/api/checkout/status", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as StatusResponseT;
        if (cancelled) return;
        setPaymentStatus(data.paymentStatus);
        // As soon as the token shows up, hard-navigate. `window.location.assign`
        // (vs router.push) forces a full page load — the download page is a
        // server component and we want a fresh server render.
        if (data.paymentStatus === "paid" && data.downloadToken) {
          window.location.assign(`/download/${data.downloadToken}`);
        }
      } catch {
        // transient; next tick will retry
      }
    }

    // Kick off interval polling AND fire one immediate poll so we don't
    // make the user stare at a blank state for 2 full seconds.
    const id = setInterval(poll, POLL_INTERVAL_MS);
    poll();
    // Cleanup function runs on unmount / dependency change.
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [router]);

  async function simulatePayment() {
    setIsSimulating(true);
    setSimulateError(null);
    try {
      const res = await fetch("/api/dev/mark-paid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setSimulateError(data.error ?? "Nie udało się oznaczyć jako opłacone.");
      }
    } catch {
      setSimulateError("Błąd sieci.");
    } finally {
      setIsSimulating(false);
    }
  }

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-8 text-center">
      <Loader color="yellow" className="bg-transparent" />

      <div className="flex flex-col gap-3">
        <h1 className="font-display text-3xl tracking-tight uppercase md:text-4xl">
          {paymentStatus === "paid"
            ? "Płatność zaksięgowana"
            : "Przetwarzamy zamówienie"}
        </h1>
        <p
          role="status"
          aria-live="polite"
          className="font-sans text-base leading-relaxed text-white/85"
        >
          {paymentStatus === "pending" && "Czekamy na potwierdzenie płatności…"}
          {paymentStatus === "paid" && "Otwieram pobieranie…"}
          {paymentStatus === "failed" && "Płatność nie powiodła się."}
          {paymentStatus === "refunded" && "Zamówienie zwrócone."}
        </p>
        <p className="font-sans text-xs tracking-wide uppercase text-white/70">
          Zamówienie {orderNumber}
        </p>
      </div>

      {isDev && paymentStatus === "pending" && (
        <div className="flex w-full flex-col items-center gap-3 border-t border-white/25 pt-6">
          <span className="font-sans text-xs tracking-wide uppercase text-white/70">
            Tylko w dev
          </span>
          <Button
            type="button"
            variant="blue-solid"
            size="compact"
            onClick={simulatePayment}
            disabled={isSimulating}
            aria-busy={isSimulating}
          >
            {isSimulating ? "Oznaczam…" : "Symuluj płatność"}
          </Button>
          {simulateError && (
            <p className="font-sans text-sm text-yellow">{simulateError}</p>
          )}
        </div>
      )}
    </div>
  );
}
