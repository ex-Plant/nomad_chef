"use server";

import { getPayload, type Payload } from "payload";
import config from "@payload-config";
import { readCheckoutCookie } from "@/lib/checkout/checkout-session";
import { asPopulated } from "@/lib/payload/as-populated";
import { ensureDownloadToken } from "@/lib/orders/fulfill-digital-order";
import {
  reconcileOrderPayment,
  type PaymentOutcomeT,
} from "./reconcile-order-payment";
import type { Order } from "@/payload-types";

// What the processing-page poll needs to act on: the settled status plus, for a
// paid digital order, the relative download URL the client navigates to. The URL
// is resolved here (it needs the write-once token) so the browser can
// router.replace() straight to /download/<token>. Routing the buyer through the
// processing server component's redirect() during router.refresh() would render
// in a streaming context, which emits the redirect client-side and flashes
// Next's default not-found page first (the (site) group has no not-found.tsx).
export type CheckoutOutcomeT = {
  readonly status: PaymentOutcomeT;
  readonly downloadUrl?: string;
};

// The store sells only digital products, so a non-digital paid order is a safety
// net: it mints no token and the client falls back to re-rendering the paid
// screen. Mirrors the same guard in the processing page.
async function resolvePaid(
  payload: Payload,
  order: Order,
): Promise<CheckoutOutcomeT> {
  const product = asPopulated(order.product);
  if (product?.format !== "digital") return { status: "paid" };
  const token = await ensureDownloadToken({ payload, order });
  return { status: "paid", downloadUrl: `/download/${token}` };
}

// Called by /checkout/processing while an order sits `pending`. Resolves the
// buyer's order from the signed checkout cookie (never a client-supplied id) and
// reports the settled status (+ download URL when paid digital).
//
// `pull` gates the authoritative P24 PULL. During the early grace polls the
// client passes pull=false: we read the DB only, giving P24's urlStatus webhook
// time to flip the order without us hammering P24. After the grace window the
// client passes pull=true and we PULL — the same logic the daily cron runs — to
// surface a failure P24 never webhooks. See reconcile-order-payment.ts for the
// P24 status mapping.
export async function checkPaymentOutcome(
  { pull }: { pull: boolean } = { pull: true },
): Promise<CheckoutOutcomeT> {
  const session = await readCheckoutCookie();
  if (!session) {
    console.log(`[P24-TRACE] checkPaymentOutcome no checkout cookie → pending`);
    return { status: "pending" };
  }

  const payload = await getPayload({ config });
  const order = await payload
    .findByID({ collection: "orders", id: session.orderId, depth: 1 })
    .catch(() => null);
  if (!order) {
    console.log(
      `[P24-TRACE] checkPaymentOutcome orderId=${session.orderId} not found → pending`,
    );
    return { status: "pending" };
  }

  // [P24-TRACE] temporary: this is the server action behind the POST rows in the
  // Vercel log — entry status tells you which branch the poll takes.
  console.log(
    `[P24-TRACE] checkPaymentOutcome orderNumber=${order.orderNumber} ` +
      `currentStatus=${order.paymentStatus} pull=${pull}`,
  );

  if (order.paymentStatus === "paid") return resolvePaid(payload, order);
  if (order.paymentStatus === "failed") return { status: "failed" };
  // Any other terminal state (e.g. `refunded`) reports `pending` so the poll just
  // keeps spinning rather than navigating. A refund landing while the buyer still
  // watches this page is practically unreachable (refunds are manual/post-
  // settlement, never within the payable window); a refunded order still renders
  // its own copy on the next full load. See docs/przelewy24.md §1 "Dropped: the
  // per-tick router.refresh()".
  if (order.paymentStatus !== "pending") return { status: "pending" };

  // Grace window: DB-only read, let the webhook settle it before we PULL P24.
  if (!pull) return { status: "pending" };

  const outcome = await reconcileOrderPayment({ payload, order });
  console.log(
    `[P24-TRACE] checkPaymentOutcome orderNumber=${order.orderNumber} → ${outcome}`,
  );
  if (outcome === "paid") return resolvePaid(payload, order);
  return { status: outcome };
}
