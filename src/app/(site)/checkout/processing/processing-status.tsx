"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shared/button";
import { Loader } from "@/components/shared/loader";
import { HelpDialog } from "@/components/sections/contact/help-dialog";
import { checkPaymentOutcome } from "@/lib/orders/check-payment-outcome";

type PaymentStatusT = "pending" | "paid" | "failed" | "refunded";

type ProcessingStatusPropsT = {
  orderNumber: string;
  customerEmail: string | null;
  paymentStatus: PaymentStatusT;
};

export function ProcessingStatus({
  orderNumber,
  customerEmail,
  paymentStatus,
}: ProcessingStatusPropsT) {
  const router = useRouter();
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);

  // The buyer is sent here by P24's urlReturn at roughly the same moment as the
  // urlStatus webhook fires — the browser often wins, so we land on a `pending`
  // order. Poll by re-running the server component; once the order is paid and
  // digital fulfillment stamped a token, the page itself redirects to
  // /download/<token>.
  //
  // The first GRACE_POLLS only chase that success race (the webhook flipping the
  // order to paid). After the grace window we additionally PULL P24 for the
  // authoritative outcome via checkPaymentOutcome — P24 never webhooks a failed
  // or cancelled payment, so this is what surfaces a failure in seconds instead
  // of spinning all the way to the timeout. Past MAX_POLLS we stop and switch to
  // the manual/help state (download email is the fallback).
  useEffect(() => {
    if (paymentStatus !== "pending") return;
    let polls = 0;
    let cancelled = false;

    const id = setInterval(async () => {
      polls += 1;
      if (polls > MAX_POLLS) {
        clearInterval(id);
        setHasTimedOut(true);
        return;
      }

      if (polls > GRACE_POLLS) {
        const outcome = await checkPaymentOutcome().catch(() => "pending");
        if (cancelled) return;
        if (outcome === "paid" || outcome === "failed") {
          clearInterval(id);
          router.refresh();
          return;
        }
      }

      router.refresh();
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [paymentStatus, router]);

  const isPaymentProblem =
    paymentStatus === "failed" || paymentStatus === "refunded";
  // Still pending after the poll window: webhook hasn't settled in-browser.
  const isStalled = paymentStatus === "pending" && hasTimedOut;
  const showHelp = isPaymentProblem || isStalled;

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

      {!isStalled && <Loader color="yellow" className="bg-transparent" />}

      <div className="flex flex-col gap-3">
        <h1 className="font-display text-3xl tracking-tight uppercase md:text-4xl">
          {resolveHeading(paymentStatus, isStalled)}
        </h1>
        <p
          role="status"
          aria-live="polite"
          className="font-sans text-base leading-relaxed text-white/85"
        >
          {paymentStatus === "pending" &&
            (isStalled
              ? "Potwierdzenie płatności trwa dłużej niż zwykle. Link do pobrania wyślemy na Twój adres e-mail, gdy tylko płatność zostanie zaksięgowana. Możesz też sprawdzić ponownie teraz."
              : "Czekamy na potwierdzenie płatności.")}
          {paymentStatus === "paid" && "Zamówienie zostało opłacone."}
          {paymentStatus === "failed" && "Płatność nie powiodła się."}
          {paymentStatus === "refunded" && "Zamówienie zwrócone."}
        </p>
        <p className="font-sans text-xs tracking-wide text-white/70 uppercase">
          Zamówienie {orderNumber}
        </p>
      </div>

      {isStalled && (
        <Button
          type="button"
          variant="blue-solid"
          size="compact"
          onClick={() => router.refresh()}
        >
          Sprawdź ponownie
        </Button>
      )}

      {showHelp && (
        <Button
          type="button"
          variant="blue-solid"
          size="compact"
          onClick={() => setIsHelpOpen(true)}
        >
          Mam problem z płatnością
        </Button>
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

function resolveHeading(status: PaymentStatusT, isStalled: boolean): string {
  if (status === "paid") return "Płatność zaksięgowana";
  if (isStalled) return "Potwierdzamy płatność";
  return "Zamówienie utworzone";
}

const POLL_INTERVAL_MS = 3000;
// First 2 polls (~6s) only wait on the webhook-driven success race before we
// start PULLing P24 — avoids flashing a failed state during a normal fast settle.
const GRACE_POLLS = 2;
// 70 × 3s ≈ 3.5 min — covers P24's first webhook retry (+3 min), then stop;
// the download email is the fallback and the buyer can re-check manually.
const MAX_POLLS = 70;
