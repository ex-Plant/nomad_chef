import type { CollectionAfterChangeHook } from "payload";
import { generateDownloadToken } from "@/lib/billing";
import { sendEmail } from "@/lib/email";

const DOWNLOAD_TTL_DAYS = 30;

export const digitalFulfillment: CollectionAfterChangeHook = async ({ doc, previousDoc, req, operation, context }) => {
  if (context?.skipFulfillment) return doc;
  if (operation !== "update" && operation !== "create") return doc;

  const wasNotPaid = !previousDoc || previousDoc.paymentStatus !== "paid";
  const isNowPaid = doc.paymentStatus === "paid";
  if (!(wasNotPaid && isNowPaid)) return doc;

  const product = typeof doc.product === "object"
    ? doc.product
    : await req.payload.findByID({ collection: "products", id: doc.product, depth: 0 });
  if (product.format !== "digital") return doc;

  const customer = typeof doc.customer === "object"
    ? doc.customer
    : await req.payload.findByID({ collection: "customers", id: doc.customer, depth: 0 });

  const token = generateDownloadToken();
  const expiresAt = new Date(Date.now() + DOWNLOAD_TTL_DAYS * 24 * 60 * 60 * 1000);

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
  });

  const downloadUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/download/${token}`;
  await sendEmail({
    to: customer.email,
    subject: "Twoja książka jest gotowa do pobrania",
    text: `Cześć ${customer.firstName ?? ""},\n\nDziękujemy za zakup. Pobierz swoją książkę:\n${downloadUrl}\n\nLink wygasa ${expiresAt.toLocaleDateString("pl-PL")}, masz ${doc.downloadLimit ?? 5} prób pobrania.\n\nMiłej lektury!`,
  });

  return doc;
};
