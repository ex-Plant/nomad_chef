"use server";

import { getPayload } from "payload";
import config from "@payload-config";
import { cartFormSchema } from "@/lib/cart-schema";
import { setCheckoutCookie } from "@/lib/checkout-session";
import { findActiveProduct } from "./find-active-product";
import { persistCustomerAndOrder } from "./persist-customer-and-order";
import { sendInterestThanks } from "./send-interest-thanks";
import { ENV } from "@/config/env";
import { registerTransaction, plnToGrosze } from "@/lib/payments/p24";

type CreateOrderResultT =
  | { ok: true; orderNumber: string; totalGross: number; redirectUrl: string }
  | { ok: false; error: string };

export async function createOrder(input: unknown): Promise<CreateOrderResultT> {
  const parsed = cartFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Nieprawidłowe dane" };
  }
  const values = parsed.data;

  const payload = await getPayload({ config });
  const productResult = await findActiveProduct(payload, values);
  if (!productResult.ok) {
    return productResult;
  }
  const { product } = productResult;

  const persistResult = await persistCustomerAndOrder({
    payload,
    values,
    product,
  });
  if (!persistResult.ok) {
    return persistResult;
  }
  const { order } = persistResult;

  // TODO: When ebook sales launch, revert to sendOrderConfirmation below
  // (re-add `import { ENV } from "@/config/env";` and the
  // `sendOrderConfirmation` import). For now the customer gets a generic
  // pre-launch thank-you and no order-details email is sent to the operator.
  //
  // await sendOrderConfirmation({
  //   payload,
  //   order,
  //   values,
  //   product,
  //   emailTo: ENV.EMAIL_TO,
  // });
  await sendInterestThanks({ customerEmail: values.email });

  // Stamp a signed cookie holding the order id so the next page
  // (/checkout/processing) can identify this anonymous buyer without a
  // query param. See src/lib/checkout-session.ts for the cookie format.
  await setCheckoutCookie(order.id);

  // Register the transaction with Przelewy24 and hand the buyer to the P24
  // paywall. sessionId is the orderNumber so the webhook can match P24's
  // notification back to this order. The pending→paid flip happens in
  // src/app/api/p24/webhook, which then triggers digital fulfillment
  // (download token + email) via the orders afterChange hook.
  try {
    const { redirectUrl } = await registerTransaction({
      sessionId: order.orderNumber,
      amountGrosze: plnToGrosze(order.totalGross),
      description: `Chaos Kitchen — zamówienie ${order.orderNumber}`,
      email: values.email,
      urlReturn: `${ENV.SITE_URL}/checkout/processing`,
      urlStatus: `${ENV.SITE_URL}/api/p24/webhook`,
    });

    return {
      ok: true,
      orderNumber: order.orderNumber,
      totalGross: order.totalGross,
      redirectUrl,
    };
  } catch (err) {
    console.error("[createOrder] P24 register failed", err);
    return {
      ok: false,
      error: "Nie udało się rozpocząć płatności. Spróbuj ponownie.",
    };
  }
}
