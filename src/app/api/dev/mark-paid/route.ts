/**
 * POST /api/dev/mark-paid
 *
 * DEV-ONLY shortcut that flips an order from `pending` → `paid` without
 * going through a real payment provider. Triggered by the "Simulate payment"
 * button on /checkout/processing.
 *
 * Why it exists:
 * Until Stripe (or similar) is wired up, the only way to test the
 * fulfillment flow end-to-end is to manually flip the status. This route
 * encapsulates that for the dev UI.
 *
 * Why it's safe:
 * The very first check returns 404 in production. So this code path is
 * unreachable on chaoskitchen.pl — even if an attacker knew the URL,
 * they'd get the same "Not found" as any unknown route.
 *
 * When real payments are added, this route can stay (handy for staging
 * testing) or be deleted — nothing else in the framework depends on it.
 */

import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";

export const dynamic = "force-dynamic";

type BodyT = { orderNumber?: unknown };

export async function POST(req: Request): Promise<Response> {
  // Hard kill switch in prod. Must be the first check so we never even
  // parse a body or hit the DB on production traffic.
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // `req.json()` throws on invalid JSON — `.catch(() => ({}))` makes it
  // tolerant so we can return a clean 400 below instead of a 500.
  const body = (await req.json().catch(() => ({}))) as BodyT;
  const orderNumber =
    typeof body.orderNumber === "string" ? body.orderNumber : null;
  if (!orderNumber) {
    return NextResponse.json(
      { error: "orderNumber required" },
      { status: 400 },
    );
  }

  const payload = await getPayload({ config });
  // Look up by the human-friendly orderNumber (not the DB id) because
  // that's what the client knows.
  const result = await payload.find({
    collection: "orders",
    where: { orderNumber: { equals: orderNumber } },
    limit: 1,
    depth: 0,
  });
  const order = result.docs[0];
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  // Refuse if the order isn't pending — avoids "double-fulfilling" an
  // already-paid order during dev hot-reload spam.
  if (order.paymentStatus !== "pending") {
    return NextResponse.json(
      { error: `Order already in status: ${order.paymentStatus}` },
      { status: 400 },
    );
  }

  // The crucial line. This update fires the `digitalFulfillment` afterChange
  // hook on the orders collection, which generates the download token and
  // emails the customer. We don't need to do anything else here.
  await payload.update({
    collection: "orders",
    id: order.id,
    data: {
      paymentStatus: "paid",
      // `paymentRef` is normally the Stripe payment intent id; we stamp a
      // fake one so it's obvious in the admin which orders came from dev.
      paymentRef: `dummy-${new Date().toISOString()}`,
    },
  });

  return NextResponse.json({ ok: true, orderNumber });
}
