/**
 * Fires on every orders write. When the order transitions to `paymentStatus: "paid"`
 * for the first time AND the product is digital, generate a download token, stamp
 * fulfillment metadata, and email the customer. The same hook handles dev simulator,
 * future payment webhooks, and admin manual flips.
 */

import type { CollectionAfterChangeHook } from "payload";
import {
  generateDownloadToken,
  nextDownloadExpiry,
} from "@/lib/orders/download-token";
import { sendDownloadEmail } from "@/lib/orders/send-download-email";
import { resolveRelation } from "@/lib/payload/resolve-relation";

export const digitalFulfillment: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req,
  operation,
  context,
}) => {
  // Recursion guard for the self-update below.
  if (context?.skipFulfillment) return doc;
  if (operation !== "update" && operation !== "create") return doc;

  const wasNotPaid = !previousDoc || previousDoc.paymentStatus !== "paid";
  const isNowPaid = doc.paymentStatus === "paid";
  if (!(wasNotPaid && isNowPaid)) return doc;

  const product = await resolveRelation({
    collection: "products",
    value: doc.product,
    req,
  });
  if (product.format !== "digital") return doc;

  const customer = await resolveRelation({
    collection: "customers",
    value: doc.customer,
    req,
  });

  const token = generateDownloadToken();
  const expiresAt = nextDownloadExpiry();
  const now = new Date().toISOString();

  await req.payload.update({
    collection: "orders",
    id: doc.id,
    data: {
      downloadToken: token,
      downloadExpiresAt: expiresAt.toISOString(),
      paidAt: doc.paidAt ?? now,
      fulfillmentStatus: "fulfilled",
      fulfilledAt: now,
    },
    context: { skipFulfillment: true },
    req,
  });

  await sendDownloadEmail({
    customerEmail: customer.email,
    customerFirstName: customer.firstName,
    downloadToken: token,
    downloadExpiresAt: expiresAt,
  });

  return doc;
};
