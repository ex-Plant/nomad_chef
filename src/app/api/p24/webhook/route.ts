/**
 * POST /api/p24/webhook — Przelewy24 transaction notification (urlStatus).
 *
 * P24 POSTs here for SUCCESSFUL payments only, and retries delivery until we
 * acknowledge with a 200. So we:
 *   1. validate the notification `sign` (reject spoofed payloads),
 *   2. match it to the order via sessionId (= the order's paymentSessionId),
 *   3. guard against amount tampering,
 *   4. mandatorily call transaction/verify — the payment is NOT settled to
 *      us until verify succeeds, so we never mark paid on the notification
 *      alone,
 *   5. flip the order pending→paid, which triggers the digitalFulfillment
 *      afterChange hook (download token + email).
 *
 * Idempotent: a repeat notification for an already-paid order returns 200
 * without re-verifying. On any failure we respond non-2xx so P24 retries.
 */

import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import {
  isValidNotificationSign,
  p24NotificationSchema,
  verifyTransaction,
} from "@/lib/payments/p24";
import { plnToGrosze } from "@/lib/payments/amount";

export const dynamic = "force-dynamic";

export async function POST(req: Request): Promise<Response> {
  const parsed = p24NotificationSchema.safeParse(
    await req.json().catch(() => null),
  );
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const notification = parsed.data;

  // Reject spoofed notifications before touching the DB.
  if (!isValidNotificationSign(notification)) {
    console.warn(
      `[p24:webhook] bad sign for sessionId=${notification.sessionId}`,
    );
    return NextResponse.json({ error: "Bad sign" }, { status: 400 });
  }

  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "orders",
    where: { paymentSessionId: { equals: notification.sessionId } },
    limit: 1,
    depth: 0,
  });
  const order = result.docs[0];
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Amount-tampering guard: the notified amount must match what we charged.
  if (notification.amount !== plnToGrosze(order.totalGross)) {
    console.error(
      `[p24:webhook] amount mismatch for ${notification.sessionId}: ` +
        `notified ${notification.amount}, expected ${plnToGrosze(order.totalGross)}`,
    );
    return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
  }

  // Idempotent: P24 retries until we 200. Already-paid → just acknowledge.
  if (order.paymentStatus === "paid") {
    return NextResponse.json({ ok: true });
  }

  const verified = await verifyTransaction({
    sessionId: notification.sessionId,
    orderId: notification.orderId,
    amountGrosze: notification.amount,
  });
  if (!verified) {
    console.error(
      `[p24:webhook] verify failed for ${notification.sessionId} ` +
        `(orderId=${notification.orderId})`,
    );
    // Non-2xx so P24 retries on its schedule.
    return NextResponse.json({ error: "Verification failed" }, { status: 502 });
  }

  // Flip to paid → digitalFulfillment hook issues the token + download email.
  await payload.update({
    collection: "orders",
    id: order.id,
    data: {
      paymentStatus: "paid",
      paymentRef: String(notification.orderId),
      paidAt: new Date().toISOString(),
    },
  });

  return NextResponse.json({ ok: true });
}
