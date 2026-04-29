"use server";

import { getPayload } from "payload";
import config from "@payload-config";
import { ENV } from "@/config/env";
import { sendEmail } from "@/lib/email";
import { cartFormSchema } from "@/lib/cart-schema";
import {
  buildAddressesToAdd,
  mergeAddresses,
  type AddressT,
} from "@/lib/cart-merge";

type CreateOrderResultT =
  | { ok: true; orderNumber: string; totalGross: number }
  | { ok: false; error: string };

export async function createOrder(input: unknown): Promise<CreateOrderResultT> {
  const parsed = cartFormSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Nieprawidłowe dane" };
  const v = parsed.data;

  const payload = await getPayload({ config });

  const products = await payload.find({
    collection: "products",
    where: {
      slug: { equals: v.productSlug },
      active: { equals: true },
    },
    limit: 1,
    depth: 0,
  });
  const product = products.docs[0];
  if (!product) return { ok: false, error: "Produkt niedostępny" };
  if (product.format !== v.format) return { ok: false, error: "Nieprawidłowy format" };

  const addressesToAdd = buildAddressesToAdd(v);

  const existingCustomers = await payload.find({
    collection: "customers",
    where: { email: { equals: v.email } },
    limit: 1,
    depth: 0,
  });
  let customerId: string | number;
  if (!existingCustomers.docs[0]) {
    const created = await payload.create({
      collection: "customers",
      data: {
        email: v.email,
        firstName: v.firstName,
        lastName: v.lastName,
        addresses: addressesToAdd,
      },
    });
    customerId = created.id;
  } else {
    const existing = existingCustomers.docs[0];
    const { merged, changed } = mergeAddresses(
      (existing.addresses ?? []) as AddressT[],
      addressesToAdd,
    );
    if (changed) {
      await payload.update({
        collection: "customers",
        id: existing.id,
        data: { addresses: merged },
      });
    }
    customerId = existing.id;
  }

  const shippingAddressForOrder =
    v.format === "physical"
      ? {
          firstName: v.firstName,
          lastName: v.lastName,
          line1: v.shippingLine1,
          line2: v.shippingLine2 || undefined,
          city: v.shippingCity,
          postalCode: v.shippingPostalCode,
          country: v.shippingCountry || "PL",
        }
      : undefined;

  // Payload's generated create type demands hook-populated fields (orderNumber,
  // totalGross, etc.) which are set by beforeChange hooks. The cast is the documented
  // workaround; same pattern in src/scripts/seed-orders.ts.
  const order = await payload.create({
    collection: "orders",
    data: {
      product: product.id,
      customer: customerId,
      quantity: v.format === "physical" ? v.quantity : 1,
      wantsInvoice: v.wantsInvoice,
      shippingAddress: shippingAddressForOrder,
    } as never,
  });

  await sendEmail({
    to: ENV.EMAIL_TO,
    subject: `Nowe zamówienie ${order.orderNumber}`,
    text: [
      `Zamówienie: ${order.orderNumber}`,
      `Produkt: ${product.title} (${product.format})`,
      `Ilość: ${order.quantity}`,
      `Kwota: ${order.totalGross} PLN`,
      `Klient: ${v.firstName} ${v.lastName} <${v.email}>`,
      v.wantsInvoice ? `Faktura: ${v.companyName} (NIP ${v.nip})` : "",
    ]
      .filter(Boolean)
      .join("\n"),
  });

  return {
    ok: true,
    orderNumber: order.orderNumber,
    totalGross: order.totalGross,
  };
}
