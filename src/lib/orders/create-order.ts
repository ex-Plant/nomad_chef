"use server";

import { after } from "next/server";
import { redirect } from "next/navigation";
import { getPayload } from "payload";
import config from "@payload-config";
import { cartFormSchema } from "@/lib/cart/cart-schema";
import { setCheckoutCookie } from "@/lib/checkout/checkout-session";
import { findActiveProduct } from "./find-active-product";
import { persistCustomerAndOrder } from "./persist-customer-and-order";
import { sendOrderConfirmation } from "./send-order-confirmation";
import { ENV } from "@/config/env";
import { registerTransaction } from "@/lib/payments/p24";
import { plnToGrosze } from "@/lib/payments/amount";

// createOrder never resolves to a success value on the client: on success it
// issues a server-side redirect to the P24 paywall (see redirect() below), so
// the only value it ever returns is a failure for the form to surface.
type CreateOrderResultT = { ok: false; error: string };

export async function createOrder(input: unknown): Promise<CreateOrderResultT> {
  const parsed = cartFormSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Nieprawidłowe dane" };

  const values = parsed.data;

  const payload = await getPayload({ config });
  const productResult = await findActiveProduct(payload, values);
  if (!productResult.ok) return productResult;

  const { product } = productResult;

  const persistResult = await persistCustomerAndOrder({
    payload,
    values,
    product,
  });

  if (!persistResult.ok) return persistResult;
  const { order } = persistResult;

  // [P24-TRACE] temporary: the order is now persisted as `pending` — capture its
  // identity so every later P24-TRACE line for this sessionId can be joined back.
  console.log(
    `[P24-TRACE] order created id=${order.id} orderNumber=${order.orderNumber} ` +
      `sessionId=${order.paymentSessionId} totalGross=${order.totalGross}`,
  );

  // The operator notice doesn't feed the redirect, so defer it past the response
  // with after(): it no longer blocks the buyer's path to the P24 paywall, and
  // the platform keeps the function alive (via waitUntil) to finish the send.
  // It swallows its own errors, so this never rejects.
  after(() =>
    sendOrderConfirmation({ order, values, product, emailTo: ENV.EMAIL_TO }),
  );

  // Stamp a signed cookie holding the order id so the next page
  // (/checkout/processing) can identify this anonymous buyer without a
  // query param. See src/lib/checkout-session.ts for the cookie format.
  await setCheckoutCookie(order.id);

  // Register the transaction with Przelewy24 and hand the buyer to the P24
  // paywall. sessionId is the order's unique paymentSessionId (NOT the reusable
  // orderNumber — P24 rejects a re-registered sessionId), so the webhook can
  // match P24's notification back to this order. The pending→paid flip happens
  // in src/app/api/p24/webhook, which then triggers digital fulfillment
  // (download token + email) via the orders afterChange hook.
  if (!order.paymentSessionId) {
    console.error("[createOrder] order is missing paymentSessionId", order.id);
    return {
      ok: false,
      error: "Nie udało się rozpocząć płatności. Spróbuj ponownie.",
    };
  }
  let redirectUrl: string;
  try {
    ({ redirectUrl } = await registerTransaction({
      sessionId: order.paymentSessionId,
      amountGrosze: plnToGrosze(order.totalGross),
      description: `Chaos Kitchen — zamówienie ${order.orderNumber}`,
      email: values.email,
      urlReturn: `${ENV.SITE_URL}/checkout/processing`,
      urlStatus: `${ENV.SITE_URL}/api/p24/webhook`,
    }));
  } catch (err) {
    console.error("[createOrder] P24 register failed", err);
    return {
      ok: false,
      error: "Nie udało się rozpocząć płatności. Spróbuj ponownie.",
    };
  }

  // Hand off to the P24 paywall with a server-side redirect (303) instead of
  // returning the URL for the client to assign to window.location. We just set
  // the checkout cookie, which makes this a *mutating* action — Next then
  // auto-refreshes the current route, and that RSC fetch raced the client-side
  // window.location handoff. WebKit aborted the cross-origin navigation and
  // flashed its native "this page couldn't load" error before the paywall.
  // A server redirect supersedes the refresh, so there is no race. redirect()
  // throws NEXT_REDIRECT, so it MUST sit outside the try/catch above.
  redirect(redirectUrl);
}
