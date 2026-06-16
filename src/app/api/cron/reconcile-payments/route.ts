/**
 * GET /api/cron/reconcile-payments — daily Przelewy24 reconciliation sweep.
 *
 * Closes the gap the in-browser poll can't: P24 only PUSHes its urlStatus
 * webhook for SUCCESSFUL payments, and the only failure detector
 * (checkPaymentOutcome) runs client-side on /checkout/processing. A buyer whose
 * payment failed or was cancelled and who then closed the tab leaves the order
 * stuck `pending` forever. This sweep PULLs P24 for every `pending` order older
 * than the payable window and settles each via reconcileOrderPayment — flipping
 * it to paid (+ fulfilment via the orders afterChange hook) or failed.
 *
 * Scheduled once a day in vercel.json (Hobby plan's 24h floor). Guarded by
 * CRON_SECRET (Vercel sends `Authorization: Bearer <CRON_SECRET>`). Cron jobs
 * run on production deployments only.
 */

import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { reconcileOrderPayment } from "@/lib/orders/reconcile-order-payment";
import { fulfillDigitalOrder } from "@/lib/orders/fulfill-digital-order";
import { P24_PAYABLE_WINDOW_MS } from "@/config/payments";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

// Cap per run so a runaway backlog can't blow the function duration limit. At
// this scale it is never hit; any leftover is logged (never silently dropped)
// and swept on the next daily run.
const MAX_ORDERS_PER_RUN = 100;

export async function GET(req: Request): Promise<Response> {
  // Read at the use site (not boot-required ENV): this secret is needed only by
  // this route and only in production, so a missing one must not crash dev/
  // preview where the cron never runs. Fail CLOSED — no secret means no run —
  // but log it, so a forgotten prod var surfaces instead of silently disabling
  // the sweep and letting `pending` orders pile up again.
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error(
      "[p24:reconcile] CRON_SECRET is not set — reconciliation cron is disabled",
    );
    return new NextResponse("Unauthorized", { status: 401 });
  }
  if (req.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const payload = await getPayload({ config });

  // Only orders past the payable window can be concluded — younger ones may
  // still settle legitimately, and any success is handled by the webhook anyway.
  const cutoff = new Date(Date.now() - P24_PAYABLE_WINDOW_MS).toISOString();
  const result = await payload.find({
    collection: "orders",
    where: {
      and: [
        { paymentStatus: { equals: "pending" } },
        { createdAt: { less_than: cutoff } },
      ],
    },
    depth: 0,
    limit: MAX_ORDERS_PER_RUN,
    sort: "createdAt",
  });

  const counts = { paid: 0, failed: 0, pending: 0, errored: 0 };
  for (const order of result.docs) {
    try {
      const outcome = await reconcileOrderPayment({ payload, order });
      counts[outcome] += 1;
    } catch (err) {
      counts.errored += 1;
      console.error(
        `[p24:reconcile] order ${order.orderNumber} failed to reconcile`,
        err,
      );
    }
  }

  const leftover = result.totalDocs - result.docs.length;
  if (leftover > 0) {
    console.warn(
      `[p24:reconcile] ${leftover} stale pending orders beyond the ` +
        `${MAX_ORDERS_PER_RUN}/run cap — they will be swept on the next run.`,
    );
  }

  console.log(
    `[p24:reconcile] swept ${result.docs.length} pending orders`,
    counts,
  );

  // Second sweep: the ONE auto-retry for paid orders whose download email is
  // still `pending` (state B — a first send that failed left it `pending`). This
  // single retry then resolves the order to `sent` or terminal `failed`, so it is
  // never re-queued. `failed` is deliberately NOT selected — that auto-retry is
  // spent; recover those with a manual resend. (fulfillDigitalOrder's write-once
  // step still issues a token if one is somehow missing before it emails.)
  const emailRetry = { resent: 0, errored: 0 };
  const unsent = await payload.find({
    collection: "orders",
    where: {
      and: [
        { paymentStatus: { equals: "paid" } },
        { downloadEmailStatus: { equals: "pending" } },
      ],
    },
    depth: 0,
    limit: MAX_ORDERS_PER_RUN,
    sort: "createdAt",
  });
  for (const order of unsent.docs) {
    try {
      await fulfillDigitalOrder({ payload, order });
      emailRetry.resent += 1;
    } catch (err) {
      emailRetry.errored += 1;
      console.error(
        `[p24:reconcile] order ${order.orderNumber} email retry failed`,
        err,
      );
    }
  }
  console.log(`[p24:reconcile] download-email retry sweep`, emailRetry);

  return NextResponse.json({
    checked: result.docs.length,
    ...counts,
    leftover,
    emailRetry,
  });
}
