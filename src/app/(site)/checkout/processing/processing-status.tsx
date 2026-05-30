"use client";

import { useEffect, useState } from "react";
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
  // order. Poll by re-running the server component; once the webhook has marked
  // the order paid and digital fulfillment stamped a token, the page itself
  // redirects to /download/<token>. The window covers P24's first webhook retry
  // (+3 min) so a single failed delivery still resolves in-browser; past that we
  // stop auto-polling and switch to a terminal state (the download email is the
  // fallback, and the buyer can re-check manually).
  useEffect(() => {
    if (paymentStatus !== "pending") return;
    let polls = 0;
    const id = setInterval(() => {
      polls += 1;
      if (polls > MAX_POLLS) {
        clearInterval(id);
        setHasTimedOut(true);
        return;
      }
      router.refresh();
    }, POLL_INTERVAL_MS);
    return () => clearInterval(id);
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
// 70 × 3s ≈ 3.5 min — covers P24's first webhook retry (+3 min), then stop;
// the download email is the fallback and the buyer can re-check manually.
const MAX_POLLS = 70;
