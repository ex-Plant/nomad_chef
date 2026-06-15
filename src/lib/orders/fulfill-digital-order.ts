import type { Payload, PayloadRequest } from "payload";
import {
  generateDownloadToken,
  nextDownloadExpiry,
} from "@/lib/orders/download-token";
import { sendDownloadEmail } from "@/lib/orders/send-download-email";
import { EMAIL_STATUS, type EmailStatusT } from "@/lib/orders/email-status";
import { asPopulated } from "@/lib/payload/as-populated";
import type { Customer, Order, Product } from "@/payload-types";

type FulfillArgsT = {
  readonly payload: Payload;
  readonly order: Order;
  // Present only on the hook path (carries the active transaction). Page/cron
  // callers use a fresh getPayload with no ambient transaction.
  readonly req?: PayloadRequest;
};

const reqOpt = (req?: PayloadRequest) => (req ? { req } : {});

async function resolveProduct({
  payload,
  order,
  req,
}: FulfillArgsT): Promise<Product | null> {
  const populated = asPopulated<Product>(order.product);
  if (populated) return populated;
  if (typeof order.product !== "number") return null;
  return payload.findByID({
    collection: "products",
    id: order.product,
    depth: 0,
    ...reqOpt(req),
  });
}

async function resolveCustomer({
  payload,
  order,
  req,
}: FulfillArgsT): Promise<Customer | null> {
  const populated = asPopulated<Customer>(order.customer);
  if (populated) return populated;
  if (typeof order.customer !== "number") return null;
  return payload.findByID({
    collection: "customers",
    id: order.customer,
    depth: 0,
    ...reqOpt(req),
  });
}

// Persist the download token WRITE-ONCE: the update only matches while the
// column is still null, so a concurrent writer (P24 return race: webhook hook vs
// the buyer's processing render) can't overwrite a token another path already
// issued. We then re-read and return whatever token is actually stored — ours if
// we won, the racer's if they did — so every caller converges on one canonical
// value. Returns the canonical token.
//
// Concurrency-safe because the paid-flip update and its afterChange hook run in
// one Payload transaction that holds the order row lock across this write; a
// concurrent page/cron call blocks on that lock, then its conditional `where`
// matches nothing and it converges on the committed token via the re-read
// below. Keep the `req` threading — it is what shares that transaction.
export async function ensureDownloadToken(args: FulfillArgsT): Promise<string> {
  const { payload, order, req } = args;
  if (order.downloadToken) return order.downloadToken;

  const candidate = generateDownloadToken();
  const expiresAt = nextDownloadExpiry();
  await payload.update({
    collection: "orders",
    where: {
      and: [{ id: { equals: order.id } }, { downloadToken: { exists: false } }],
    },
    data: {
      downloadToken: candidate,
      downloadExpiresAt: expiresAt.toISOString(),
      paidAt: order.paidAt ?? new Date().toISOString(),
    },
    context: { skipFulfillment: true },
    ...reqOpt(req),
  });

  const fresh = await payload.findByID({
    collection: "orders",
    id: order.id,
    depth: 0,
    ...reqOpt(req),
  });
  if (!fresh.downloadToken) {
    throw new Error(
      `[fulfillDigitalOrder] token missing after write for order ${order.orderNumber}`,
    );
  }
  return fresh.downloadToken;
}

// Idempotent fulfillment for a PAID DIGITAL order. Token first (write-once),
// then — only if not already sent — the download email. A failed email never
// unsets the token. Safe to call from the afterChange hook, the processing-page
// redirect, and the cron retry sweep. No-op for non-paid / non-digital orders.
export async function fulfillDigitalOrder(
  args: FulfillArgsT,
): Promise<{ token: string | null }> {
  const { payload, order, req } = args;
  if (order.paymentStatus !== "paid") return { token: null };

  const product = await resolveProduct(args);
  if (product?.format !== "digital") return { token: null };

  const token = await ensureDownloadToken(args);

  if (order.downloadEmailStatus === EMAIL_STATUS.sent) {
    return { token };
  }

  // Re-read to get the persisted expiry alongside the canonical token.
  const fresh = await payload.findByID({
    collection: "orders",
    id: order.id,
    depth: 0,
    ...reqOpt(req),
  });
  const customer = await resolveCustomer({ ...args, order: fresh });
  const expiresAt = fresh.downloadExpiresAt
    ? new Date(fresh.downloadExpiresAt)
    : nextDownloadExpiry();

  if (!customer?.email) {
    // No recipient to send to — record the failure explicitly rather than
    // emailing an empty address. The token is already persisted, so the cron
    // retry sweep can resend once the customer record is fixed.
    await payload.update({
      collection: "orders",
      id: order.id,
      data: {
        downloadEmailStatus: EMAIL_STATUS.failed,
        downloadEmailError: "no customer email on order",
      },
      context: { skipFulfillment: true },
      ...reqOpt(req),
    });
    return { token };
  }

  let emailStatus: EmailStatusT = EMAIL_STATUS.sent;
  let emailError: string | null = null;
  try {
    await sendDownloadEmail({
      customerEmail: customer.email,
      customerFirstName: customer.firstName,
      downloadToken: token,
      downloadExpiresAt: expiresAt,
    });
  } catch (err) {
    console.error("[fulfillDigitalOrder] download email failed", err);
    emailStatus = EMAIL_STATUS.failed;
    emailError = err instanceof Error ? err.message : String(err);
  }

  const sent = emailStatus === EMAIL_STATUS.sent;
  const now = new Date().toISOString();
  await payload.update({
    collection: "orders",
    id: order.id,
    data: {
      fulfillmentStatus: sent ? "fulfilled" : fresh.fulfillmentStatus,
      fulfilledAt: sent ? now : fresh.fulfilledAt,
      downloadEmailStatus: emailStatus,
      downloadEmailSentAt: sent ? now : null,
      downloadEmailError: emailError,
    },
    context: { skipFulfillment: true },
    ...reqOpt(req),
  });

  return { token };
}
