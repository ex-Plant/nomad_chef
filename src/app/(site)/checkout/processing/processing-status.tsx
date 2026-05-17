"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/shared/button";
import { Loader } from "@/components/shared/loader";
import { HelpDialog } from "@/components/sections/contact/help-dialog";

type StatusResponseT = {
  orderNumber: string;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  downloadToken: string | null;
};

type ProcessingStatusPropsT = {
  orderNumber: string;
  customerEmail: string | null;
  isDev: boolean;
};

type SimulateStateT = "idle" | "loading" | "error";

const POLL_INTERVAL_MS = 2000;

export function ProcessingStatus({
  orderNumber,
  customerEmail,
  isDev,
}: ProcessingStatusPropsT) {
  const [paymentStatus, setPaymentStatus] =
    useState<StatusResponseT["paymentStatus"]>("pending");
  const [simulateState, setSimulateState] = useState<SimulateStateT>("idle");
  const [simulateError, setSimulateError] = useState<string | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch("/api/checkout/status", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as StatusResponseT;
        if (cancelled) return;
        setPaymentStatus(data.paymentStatus);
        // Full reload — the download page is a server component that needs a fresh render.
        if (data.paymentStatus === "paid" && data.downloadToken) {
          window.location.assign(`/download/${data.downloadToken}`);
        }
      } catch {
        // transient; next tick will retry
      }
    }

    const id = setInterval(poll, POLL_INTERVAL_MS);
    poll();
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  async function simulatePayment() {
    setSimulateState("loading");
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
        setSimulateState("error");
        return;
      }
      setSimulateState("idle");
    } catch {
      setSimulateError("Błąd sieci.");
      setSimulateState("error");
    }
  }

  const isPaymentProblem =
    paymentStatus === "failed" || paymentStatus === "refunded";

  const helpContext = {
    surface: "checkout" as const,
    status: paymentStatus,
    orderNumber,
  };

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
        <p className="font-sans text-xs tracking-wide text-white/70 uppercase">
          Zamówienie {orderNumber}
        </p>
      </div>

      {isPaymentProblem && (
        <Button
          type="button"
          variant="blue-solid"
          size="compact"
          onClick={() => setIsHelpOpen(true)}
        >
          Mam problem z płatnością
        </Button>
      )}

      {isDev && paymentStatus === "pending" && (
        <div className="flex w-full flex-col items-center gap-3 border-t border-white/25 pt-6">
          <span className="font-sans text-xs tracking-wide text-white/70 uppercase">
            Tylko w dev
          </span>
          <Button
            type="button"
            variant="blue-solid"
            size="compact"
            onClick={simulatePayment}
            disabled={simulateState === "loading"}
            aria-busy={simulateState === "loading"}
          >
            {simulateState === "loading" ? "Oznaczam…" : "Symuluj płatność"}
          </Button>
          {simulateError && (
            <p className="text-yellow font-sans text-sm">{simulateError}</p>
          )}
        </div>
      )}

      <HelpDialog
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        context={helpContext}
        prefillEmail={customerEmail ?? undefined}
      />
    </div>
  );
}
