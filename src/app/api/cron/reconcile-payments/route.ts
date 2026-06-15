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

  // Second sweep: paid orders whose download email never sent (state B). The
  // token is healed inline on the processing page (state A), so this is about
  // delivery, not tokens — though fulfillDigitalOrder's write-once step will
  // still issue a token if one is somehow missing before it emails.
  const emailRetry = { resent: 0, errored: 0 };
  const unsent = await payload.find({
    collection: "orders",
    where: {
      and: [
        { paymentStatus: { equals: "paid" } },
        { downloadEmailStatus: { not_equals: "sent" } },
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

  // TODO(remove after tests): debug ping to konradantonik@gmail.com to confirm
  // the cron actually fires in production. Delete this whole block (and the
  // hardcoded address) once we've seen it land. Wrapped so a mail failure never
  // fails the sweep.
  try {
    await payload.sendEmail({
      to: "konradantonik@gmail.com",
      subject: `[cron] reconcile-payments ran — ${result.docs.length} swept`,
      text:
        `reconcile-payments executed.\n\n` +
        `checked: ${result.docs.length}\n` +
        `paid: ${counts.paid}\n` +
        `failed: ${counts.failed}\n` +
        `pending: ${counts.pending}\n` +
        `errored: ${counts.errored}\n` +
        `leftover: ${leftover}`,
    });
  } catch (err) {
    console.error("[p24:reconcile] debug ping email failed", err);
  }

  return NextResponse.json({
    checked: result.docs.length,
    ...counts,
    leftover,
    emailRetry,
  });
}
