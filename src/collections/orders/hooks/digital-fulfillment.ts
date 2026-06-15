/**
 * Fires on every orders write. On the first transition to `paymentStatus: "paid"`
 * for a digital product, delegates to fulfillDigitalOrder (token-first, then the
 * download email). The same core also runs on the processing-page redirect and
 * the cron email-retry sweep, so the three paths can never diverge.
 */

import type { CollectionAfterChangeHook } from "payload";
import { fulfillDigitalOrder } from "@/lib/orders/fulfill-digital-order";

export const digitalFulfillment: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req,
  operation,
  context,
}) => {
  // Recursion guard for the core's own updates.
  if (context?.skipFulfillment) return doc;
  if (operation !== "update" && operation !== "create") return doc;

  const wasNotPaid = !previousDoc || previousDoc.paymentStatus !== "paid";
  const isNowPaid = doc.paymentStatus === "paid";
  if (!(wasNotPaid && isNowPaid)) return doc;

  await fulfillDigitalOrder({ payload: req.payload, order: doc, req });
  return doc;
};
