"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shared/button";
import { Loader } from "@/components/shared/loader";
import { HelpDialog } from "@/components/sections/contact/help-dialog";

type PaymentStatusT = "pending" | "paid" | "failed" | "refunded";

type ProcessingStatusPropsT = {
  orderNumber: string;
  customerEmail: string | null;
  paymentStatus: PaymentStatusT;
};

type SimulateStateT = "idle" | "loading" | "error";

export function ProcessingStatus({
  orderNumber,
  customerEmail,
  paymentStatus,
}: ProcessingStatusPropsT) {
  const router = useRouter();
  const [simulateState, setSimulateState] = useState<SimulateStateT>("idle");
  const [simulateError, setSimulateError] = useState<string | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

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
      router.refresh();
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
      <div className="border-yellow/40 bg-yellow/10 w-full rounded-md border px-4 py-3 text-left">
        <p className="text-yellow font-sans text-sm leading-relaxed">
          <strong className="font-semibold tracking-wide uppercase">
            Wersja testowa.
          </strong>{" "}
          Strona jest w budowie — proces zamówienia nie jest jeszcze aktywny.
          Jeśli trafiłaś tu przypadkiem, wróć później.
        </p>
      </div>

      <Loader color="yellow" className="bg-transparent" />

      <div className="flex flex-col gap-3">
        <h1 className="font-display text-3xl tracking-tight uppercase md:text-4xl">
          {paymentStatus === "paid"
            ? "Płatność zaksięgowana"
            : "Zamówienie utworzone"}
        </h1>
        <p
          role="status"
          aria-live="polite"
          className="font-sans text-base leading-relaxed text-white/85"
        >
          {paymentStatus === "pending" && "Czekamy na potwierdzenie płatności."}
          {paymentStatus === "paid" && "Zamówienie zostało opłacone."}
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

      {paymentStatus === "pending" && (
        <div className="flex w-full flex-col items-center gap-3 border-t border-white/25 pt-6">
          <span className="font-sans text-xs tracking-wide text-white/70 uppercase">
            Testy
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
