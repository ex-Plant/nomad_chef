import type { CollectionAfterChangeHook } from "payload";
import { sendEmail } from "@/lib/email";

export const physicalShipped: CollectionAfterChangeHook = async ({ doc, previousDoc, req, operation, context }) => {
  if (context?.skipFulfillment) return doc;
  if (operation !== "update") return doc;
  const wasNotShipped = previousDoc.fulfillmentStatus !== "shipped";
  const isNowShipped = doc.fulfillmentStatus === "shipped";
  if (!(wasNotShipped && isNowShipped)) return doc;

  const product = typeof doc.product === "object"
    ? doc.product
    : await req.payload.findByID({ collection: "products", id: doc.product, depth: 0 });
  if (product.format !== "physical") return doc;

  const customer = typeof doc.customer === "object"
    ? doc.customer
    : await req.payload.findByID({ collection: "customers", id: doc.customer, depth: 0 });

  await req.payload.update({
    collection: "orders",
    id: doc.id,
    data: {
      shippedAt: doc.shippedAt ?? new Date().toISOString(),
    },
    context: { skipFulfillment: true },
  });

  const tracking = doc.tracking ?? "(brak numeru)";
  const courier = doc.courier ?? "(kurier nieznany)";
  await sendEmail({
    to: customer.email,
    subject: "Twoja książka jest w drodze",
    text: `Cześć ${customer.firstName ?? ""},\n\nWysłaliśmy Twoją książkę.\nKurier: ${courier}\nNumer przesyłki: ${tracking}\n\nDziękujemy!`,
  });

  return doc;
};
