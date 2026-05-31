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
  if (!session) return "pending";

  const payload = await getPayload({ config });
  const order = await payload
    .findByID({ collection: "orders", id: session.orderId, depth: 0 })
    .catch(() => null);
  if (!order) return "pending";

  if (order.paymentStatus === "paid") return "paid";
  if (order.paymentStatus === "failed") return "failed";
  if (order.paymentStatus !== "pending") return "pending";

  return reconcileOrderPayment({ payload, order });
}
