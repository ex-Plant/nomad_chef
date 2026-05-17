/**
 * GET /api/checkout/status
 *
 * Called every 2 seconds by the processing page's client component.
 * Looks up the buyer's order via the signed cookie and reports current
 * status — the polling stops once `paymentStatus === "paid"` and a
 * `downloadToken` is present.
 *
 * Why an API route AND a server component (page.tsx)?
 * The server component renders the initial HTML once. After that the
 * browser needs a way to ask "any change?" without doing a full page
 * reload. This endpoint is the cheap "any change?" probe.
 */

import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { readCheckoutCookie } from "@/lib/checkout-session";

// Same reason as the page: per-request cookie + live DB state, never cache.
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  // Identity check via the signed cookie. No cookie → 401, treat as logged-out.
  const session = await readCheckoutCookie();
  if (!session) {
    return NextResponse.json({ error: "Brak sesji koszyka." }, { status: 401 });
  }

  const payload = await getPayload({ config });
  const order = await payload
    .findByID({ collection: "orders", id: session.orderId, depth: 0 })
    .catch(() => null);
  if (!order) {
    return NextResponse.json(
      { error: "Zamówienie nie znalezione." },
      { status: 404 },
    );
  }

  // We deliberately return ONLY the fields the client needs. Don't leak
  // the full order row (which includes amounts, addresses, etc.) over an
  // endpoint that's polled by the browser.
  return NextResponse.json({
    orderNumber: order.orderNumber,
    paymentStatus: order.paymentStatus,
    downloadToken: order.downloadToken ?? null,
  });
}
