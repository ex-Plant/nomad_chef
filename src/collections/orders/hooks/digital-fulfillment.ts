/**
 * Digital fulfillment — the keystone of the digital-product delivery flow.
 *
 * BIG PICTURE (whole framework, end-to-end):
 *
 *   1. Customer submits the cart form.
 *      → `createOrder()` (src/lib/orders/create-order.ts) writes the Order row
 *        with `paymentStatus: "pending"` and sets a signed `chef_checkout`
 *        cookie holding the order id (so the next page can identify them
 *        without a logged-in user).
 *
 *   2. Customer lands on /checkout/processing.
 *      → A server component reads the cookie, finds the order, and shows a
 *        "we're processing" UI. A client component polls /api/checkout/status
 *        every 2 seconds. In dev there's also a "Simulate payment" button
 *        that calls /api/dev/mark-paid.
 *
 *   3. Something flips the order to `paymentStatus: "paid"`.
 *      → Today: dev simulator. Later: a real payment webhook (Stripe etc.)
 *        will do the same `payload.update({ paymentStatus: "paid" })`.
 *
 *   4. THIS HOOK FIRES (Payload's afterChange hook on the orders collection).
 *      → Detects the pending→paid transition, generates a single-use download
 *        token, stamps an expiry, marks the order as fulfilled, and emails
 *        the customer a link to /download/<token>.
 *
 *   5. Customer clicks the email link.
 *      → /download/<token> (server component) validates the token, then
 *        renders one of: ready / expired / exhausted / not_paid / not_found.
 *
 *   6. Customer hits "Download".
 *      → /api/download/<token>/file streams the PDF from Vercel Blob,
 *        increments `downloadCount`, stamps `lastDownloadAt`.
 *
 *   7. If the link died (expired or out of attempts) the UI offers a
 *      "resend" button → /api/download/<token>/resend rotates the token
 *      and emails a fresh one.
 *
 * WHY A HOOK INSTEAD OF DOING THIS IN createOrder?
 * The decision to fulfill must run wherever `paymentStatus` flips to "paid"
 * — that could be the dev simulator route, a Stripe webhook, an admin user
 * clicking in the Payload UI, or a future cron. A `CollectionAfterChangeHook`
 * is the single place that catches all of those.
 */

import type { CollectionAfterChangeHook } from "payload";
import { generateDownloadToken } from "@/lib/billing";
import { sendDownloadEmail } from "@/lib/orders/send-download-email";

// How long the download link stays valid after fulfillment.
// Resend rotates the token and resets this clock.
const DOWNLOAD_TTL_DAYS = 30;

export const digitalFulfillment: CollectionAfterChangeHook = async ({
  doc, // the order row AFTER the change
  previousDoc, // the order row BEFORE the change (undefined on create)
  req,
  operation, // "create" | "update" | "delete" | "read"
  context, // ad-hoc bag we pass through to suppress recursion
}) => {
  // Re-entrancy guard. Below we call `payload.update()` to write the token
  // back onto the same order — that write would re-trigger this very hook.
  // Setting `context.skipFulfillment = true` on that internal update lets
  // us short-circuit on the second pass and avoid an infinite loop.
  if (context?.skipFulfillment) return doc;

  // We only care about writes. (Payload also runs afterChange on some other
  // operations; this narrows it to real mutations.)
  if (operation !== "update" && operation !== "create") return doc;

  // Detect the *transition* from "anything else" → "paid". We deliberately
  // compare against `previousDoc` so we only fire once per order: a second
  // save while the order is already paid (e.g. an admin tweaking a field)
  // must NOT re-send the email.
  const wasNotPaid = !previousDoc || previousDoc.paymentStatus !== "paid";
  const isNowPaid = doc.paymentStatus === "paid";
  if (!(wasNotPaid && isNowPaid)) return doc;

  // Resolve the related product. Depending on how the order was saved, the
  // `product` field on the doc can be either a populated object (depth>0)
  // or just an ID (depth=0). Handle both.
  const product =
    typeof doc.product === "object"
      ? doc.product
      : await req.payload.findByID({
          collection: "products",
          id: doc.product,
          depth: 0,
          req,
        });

  // Physical products take a different fulfillment path (manual shipping).
  // We only auto-deliver digital files.
  if (product.format !== "digital") return doc;

  // Same dual-shape handling for the customer relation — we need the email.
  const customer =
    typeof doc.customer === "object"
      ? doc.customer
      : await req.payload.findByID({
          collection: "customers",
          id: doc.customer,
          depth: 0,
          req,
        });

  // Generate a fresh download token. `generateDownloadToken` returns a
  // 48-char hex string from crypto.randomBytes — long enough to be
  // unguessable, short enough to fit comfortably in a URL.
  const token = generateDownloadToken();
  const expiresAt = new Date(
    Date.now() + DOWNLOAD_TTL_DAYS * 24 * 60 * 60 * 1000,
  );

  // Persist the token + fulfillment metadata onto the order.
  // `context: { skipFulfillment: true }` is the recursion guard explained above.
  // Passing `req` re-uses the same transaction/auth context Payload gave us.
  await req.payload.update({
    collection: "orders",
    id: doc.id,
    data: {
      downloadToken: token,
      downloadExpiresAt: expiresAt.toISOString(),
      paidAt: doc.paidAt ?? new Date().toISOString(),
      fulfillmentStatus: "fulfilled",
      fulfilledAt: new Date().toISOString(),
    },
    context: { skipFulfillment: true },
    req,
  });

  // Send the "here's your download" email. This is fire-and-forget from the
  // customer's perspective; if it throws, Payload surfaces the error.
  await sendDownloadEmail({
    customerEmail: customer.email,
    customerFirstName: customer.firstName,
    downloadToken: token,
    downloadExpiresAt: expiresAt,
    downloadLimit: doc.downloadLimit ?? 5,
  });

  return doc;
};
