"use server";

import { getPayload } from "payload";
import config from "@payload-config";
import { ENV } from "@/config/env";
import { cartFormSchema } from "@/lib/cart-schema";
import { findActiveProduct } from "./find-active-product";
import { persistCustomerAndOrder } from "./persist-customer-and-order";
import { sendOrderConfirmation } from "./send-order-confirmation";

type CreateOrderResultT =
  | { ok: true; orderNumber: string; totalGross: number }
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

  const persistResult = await persistCustomerAndOrder({ payload, values, product });
  if (!persistResult.ok) {
    return persistResult;
  }
  const { order } = persistResult;

  await sendOrderConfirmation({
    payload,
    order,
    values,
    product,
    emailTo: ENV.EMAIL_TO,
  });

  return {
    ok: true,
    orderNumber: order.orderNumber,
    totalGross: order.totalGross,
  };
}
