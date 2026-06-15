"use server";

import { getPayload } from "payload";
import config from "@payload-config";
import { readCheckoutCookie } from "@/lib/checkout/checkout-session";
import {
  reconcileOrderPayment,
  type PaymentOutcomeT,
} from "./reconcile-order-payment";

// Called by /checkout/processing while an order sits `pending`. Resolves the
// buyer's order from the signed checkout cookie (never a client-supplied id),
// short-circuits if it's already settled, then hands the authoritative P24 PULL
// + transition to reconcileOrderPayment — the same logic the daily cron runs for
// buyers who have already navigated away. See reconcile-order-payment.ts for the
// P24 status mapping.
export async function checkPaymentOutcome(): Promise<PaymentOutcomeT> {
  const session = await readCheckoutCookie();
  if (!session) {
    console.log(`[P24-TRACE] checkPaymentOutcome no checkout cookie → pending`);
    return "pending";
  }

  const payload = await getPayload({ config });
  const order = await payload
    .findByID({ collection: "orders", id: session.orderId, depth: 0 })
    .catch(() => null);
  if (!order) {
    console.log(
      `[P24-TRACE] checkPaymentOutcome orderId=${session.orderId} not found → pending`,
    );
    return "pending";
  }

  // [P24-TRACE] temporary: this is the server action behind the POST rows in the
  // Vercel log — entry status tells you which branch the poll takes.
  console.log(
    `[P24-TRACE] checkPaymentOutcome orderNumber=${order.orderNumber} ` +
      `currentStatus=${order.paymentStatus}`,
  );

  if (order.paymentStatus === "paid") return "paid";
  if (order.paymentStatus === "failed") return "failed";
  if (order.paymentStatus !== "pending") return "pending";

  const outcome = await reconcileOrderPayment({ payload, order });
  console.log(
    `[P24-TRACE] checkPaymentOutcome orderNumber=${order.orderNumber} → ${outcome}`,
  );
  return outcome;
}
