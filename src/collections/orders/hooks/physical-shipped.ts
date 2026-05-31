import type { CollectionAfterChangeHook } from "payload";
import { sendEmail } from "@/lib/emails/send";
import { generateShipmentNotificationHtml } from "@/lib/emails/templates/shipment-notification";
import { resolveRelation } from "@/lib/payload/resolve-relation";

/**
 * Notifies the customer when a physical-book order is marked as shipped.
 *
 * Fires only on the not-shipped → shipped *transition* (compares previousDoc),
 * so re-saving an already-shipped order is a no-op. Skips digital orders.
 * The nested shippedAt update passes skipFulfillment to avoid re-triggering
 * this same afterChange hook.
 */
export const physicalShipped: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req,
  operation,
  context,
}) => {
  if (context?.skipFulfillment) return doc;
  if (operation !== "update") return doc;
  const wasNotShipped = previousDoc.fulfillmentStatus !== "shipped";
  const isNowShipped = doc.fulfillmentStatus === "shipped";
  if (!(wasNotShipped && isNowShipped)) return doc;

  const product = await resolveRelation({
    collection: "products",
    value: doc.product,
    req,
  });
  if (product.format !== "physical") return doc;

  const customer = await resolveRelation({
    collection: "customers",
    value: doc.customer,
    req,
  });

  await req.payload.update({
    collection: "orders",
    id: doc.id,
    data: {
      shippedAt: doc.shippedAt ?? new Date().toISOString(),
    },
    context: { skipFulfillment: true },
    req,
  });

  const tracking = doc.tracking ?? "(brak numeru)";
  const courier = doc.courier ?? "(kurier nieznany)";
  const greeting = customer.firstName
    ? `Cześć ${customer.firstName},`
    : "Cześć,";
  await sendEmail({
    to: customer.email,
    subject: "Twoja książka jest w drodze",
    text: `${greeting}\n\nWysłaliśmy Twoją książkę.\nKurier: ${courier}\nNumer przesyłki: ${tracking}\n\nDziękujemy!`,
    html: generateShipmentNotificationHtml({
      customerFirstName: customer.firstName,
      courier,
      tracking,
    }),
  });

  return doc;
};
