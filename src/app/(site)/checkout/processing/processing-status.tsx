"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shared/button";
import { Loader } from "@/components/shared/loader";
import { HelpDialog } from "@/components/sections/contact/help-dialog";
import { checkPaymentOutcome } from "@/lib/orders/check-payment-outcome";
import {
  CHECKOUT_POLL_INTERVAL_MS,
  CHECKOUT_GRACE_POLLS,
} from "@/config/payments";

type PaymentStatusT = "pending" | "paid" | "failed" | "refunded";

type ProcessingStatusPropsT = {
  orderNumber: string;
  customerEmail: string | null;
  paymentStatus: PaymentStatusT;
  // P24's payable window (ms), passed from the server so the client doesn't pull
  // the node-only p24 module into its bundle. Drives how long we poll.
  payableWindowMs: number;
};

export function ProcessingStatus({
  orderNumber,
  customerEmail,
  paymentStatus,
  payableWindowMs,
}: ProcessingStatusPropsT) {
  const router = useRouter();
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Poll for the whole payable window, derived from the window itself so polling
  // and the failure cutoff stay in lockstep.
  const maxPolls = Math.ceil(payableWindowMs / CHECKOUT_POLL_INTERVAL_MS);

  // The buyer is sent here by P24's urlReturn at roughly the same moment as the
  // urlStatus webhook fires — the browser often wins, so we land on a `pending`
  // order. Poll the order via checkPaymentOutcome; once it reports paid for a
  // digital order it hands back the /download/<token> URL and we navigate there
  // client-side with router.replace.
  //
  // We deliberately do NOT route the buyer through the processing server
  // component's own redirect() here: that redirect runs inside a router.refresh()
  // streaming render, which emits the redirect client-side and flashes Next's
  // default not-found page before the browser follows it.
  //
  // The first CHECKOUT_GRACE_POLLS only chase the success race (the webhook
  // flipping the order to paid) with a DB-only read. After the grace window we
  // additionally PULL P24 for the authoritative outcome (pull=true) — P24 never
  // webhooks a failed or cancelled payment, so this is what surfaces a failure
  // once the payable window has elapsed. Reaching maxPolls just stops the timer
  // (the pending copy already points the buyer to the download email).
  useEffect(() => {
    if (paymentStatus !== "pending") return;
    let polls = 0;
    let cancelled = false;

    const id = setInterval(async () => {
      polls += 1;
      if (polls > maxPolls) {
        console.log(
          `[P24-TRACE] poll orderNumber=${orderNumber} reached maxPolls → stop`,
        );
        clearInterval(id);
        return;
      }

      // Grace polls read the DB only (let the webhook settle it); after the grace
      // window we PULL P24 for the authoritative outcome.
      const pull = polls > CHECKOUT_GRACE_POLLS;
      // [P24-TRACE] temporary: client-side poll trace (browser console, not Vercel
      // logs). Shows whether the tab is still polling and which branch each tick hits.
      console.log(
        `[P24-TRACE] poll #${polls}/${maxPolls} orderNumber=${orderNumber} ` +
          `${pull ? "PULL" : "grace (DB only)"}`,
      );

      const result = await checkPaymentOutcome({ pull }).catch(() => ({
        status: "pending" as const,
      }));
      if (cancelled) return;
      console.log(
        `[P24-TRACE] poll #${polls} orderNumber=${orderNumber} status=${result.status}`,
      );

      if (result.status === "paid") {
        clearInterval(id);
        // Client-side nav straight to the download — never the server redirect.
        // Non-digital paid (safety net) has no URL: re-render to the paid screen.
        if (result.downloadUrl) router.replace(result.downloadUrl);
        else router.refresh();
        return;
      }
      if (result.status === "failed") {
        clearInterval(id);
        router.refresh();
        return;
      }
    }, CHECKOUT_POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [paymentStatus, router, maxPolls, orderNumber]);

  const helpContext = {
    surface: "checkout" as const,
    status: paymentStatus,
    orderNumber,
  };

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-8 text-center">
      {paymentStatus === "pending" && (
        <Loader color="yellow" className="bg-transparent" />
      )}

      <div className="flex flex-col gap-3">
        <h1 className="font-display text-3xl tracking-tight uppercase md:text-4xl">
          {resolveHeading(paymentStatus)}
        </h1>
        <p
          role="status"
          aria-live="polite"
          className="font-sans text-base leading-relaxed text-white/85"
        >
          {paymentStatus === "pending" && (
            <>
              Czekamy na potwierdzenie płatności, to nie powinno zająć dłużej
              niż kilka minut.
              <br />
              Gdy płatność trafi na nasze konto wyślemy Ci maila z linkiem do
              pobrania ebooka.
              <br />
              Na link możesz poczekać również na tej stronie.
            </>
          )}
          {paymentStatus === "paid" &&
            "Za chwilę przekierujemy Cię na stronę pobierania. Jeśli to nie nastąpi, sprawdź swój e-mail lub zgłoś problem poniżej."}
          {paymentStatus === "failed" && "Płatność nie powiodła się."}
          {paymentStatus === "refunded" && "Zamówienie zwrócone."}
        </p>
        <p className="font-sans text-xs tracking-wide text-white/70 uppercase">
          Zamówienie {orderNumber}
        </p>
      </div>

      <Button
        type="button"
        variant="blue-solid"
        size="compact"
        onClick={() => setIsHelpOpen(true)}
      >
        {paymentStatus === "paid"
          ? "Mam problem z zamówieniem"
          : "Mam problem z płatnością"}
      </Button>

      <HelpDialog
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        context={helpContext}
        prefillEmail={customerEmail ?? undefined}
      />
    </div>
  );
}

function resolveHeading(status: PaymentStatusT): string {
  if (status === "paid") return "Płatność zaksięgowana";
  if (status === "failed") return "Płatność nieudana";
  if (status === "refunded") return "Zamówienie zwrócone";
  return "Zamówienie utworzone";
}
