"use server";

import { getPayload } from "payload";
import config from "@payload-config";
import { cartFormSchema } from "@/lib/cart-schema";
import { setCheckoutCookie } from "@/lib/checkout-session";
import { findActiveProduct } from "./find-active-product";
import { persistCustomerAndOrder } from "./persist-customer-and-order";
import { sendInterestThanks } from "./send-interest-thanks";

type CreateOrderResultT =
  | { ok: true; orderNumber: string; totalGross: number }
  | { ok: false; error: string };

export async function createOrder(input: unknown): Promise<CreateOrderResultT> {
  console.log("create-order.ts:16 - :");
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

  return {
    ok: true,
    orderNumber: order.orderNumber,
    totalGross: order.totalGross,
  };
}
