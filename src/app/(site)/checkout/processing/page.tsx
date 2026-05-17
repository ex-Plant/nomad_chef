/**
 * /checkout/processing — the "we're waiting on your payment" page.
 *
 * This is a SERVER COMPONENT (no "use client"), so all the work below
 * runs on the server. The browser only receives the resulting HTML.
 *
 * Responsibilities:
 *   1. Read the signed cookie set by `createOrder()` to learn which order
 *      belongs to this browser.
 *   2. Fetch the order row from Payload to check current status.
 *   3. If the order is already paid AND a download token exists, skip
 *      this page entirely — redirect straight to the download page.
 *      (This handles the case where the customer reloads after payment.)
 *   4. Otherwise render the spinner + polling component. The client-side
 *      component will hit /api/checkout/status every 2s until the order
 *      flips to paid.
 */

import { redirect } from "next/navigation";
import { getPayload } from "payload";
import config from "@payload-config";
import { readCheckoutCookie } from "@/lib/checkout-session";
import { ProcessingStatus } from "./processing-status";

// `force-dynamic` tells Next.js: never cache this page at build time and
// never use ISR. Each request must run the function fresh, because:
//   - we read cookies (per-request state)
//   - we query the DB for live order status
// Without this the App Router might try to static-generate and crash.
export const dynamic = "force-dynamic";

export default async function CheckoutProcessingPage() {
  // No cookie → someone hit /checkout/processing directly without going
  // through the cart. Bounce them home.
  const session = await readCheckoutCookie();
  if (!session) redirect("/");

  // `getPayload({ config })` returns the Payload local API client. We use
  // it instead of HTTP fetch because we're on the same server — no auth
  // headers, no network round-trip.
  const payload = await getPayload({ config });
  const order = await payload
    .findByID({ collection: "orders", id: session.orderId, depth: 0 })
    // `.catch` because findByID throws on not-found rather than returning
    // null. We coerce to null and handle below.
    .catch(() => null);
  if (!order) redirect("/");

  // Fast-path: if the user lands here AFTER the hook already ran (e.g.
  // they refreshed the page), send them straight to the file.
  if (order.paymentStatus === "paid" && order.downloadToken) {
    redirect(`/download/${order.downloadToken}`);
  }

  // We pass `isDev` to the client so it knows whether to render the
  // "Simulate payment" button (visible only in `next dev`).
  const isDev = process.env.NODE_ENV !== "production";

  return (
    <main className="bg-coral relative flex min-h-lvh flex-col items-center justify-center px-6 py-24 text-white">
      <ProcessingStatus orderNumber={order.orderNumber} isDev={isDev} />
    </main>
  );
}
