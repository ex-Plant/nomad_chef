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
import type { CartFormValuesT } from "@/lib/cart-schema";

type CreateOrderResultT =
  | { ok: true; orderNumber: string; totalGross: number }
  | { ok: false; error: string };

const DEFAULT_COUNTRY = "PL";

type PayloadT = Awaited<ReturnType<typeof getPayload>>;

function invalidOrder(error: string): CreateOrderResultT {
  return { ok: false, error };
}

async function findActiveProduct(
  payload: PayloadT,
  values: CartFormValuesT,
) {
  const products = await payload.find({
    collection: "products",
    where: {
      slug: { equals: values.productSlug },
      active: { equals: true },
    },
    limit: 1,
    depth: 0,
  });

  const product = products.docs[0];

  if (!product) {
    return invalidOrder("Produkt niedostępny");
  }

  if (product.format !== values.format) {
    return invalidOrder("Nieprawidłowy format");
  }

  return product;
}

async function findOrCreateCustomer(
  payload: PayloadT,
  values: CartFormValuesT,
  addressesToAdd: AddressT[],
): Promise<string | number> {
  const existingCustomers = await payload.find({
    collection: "customers",
    where: { email: { equals: values.email } },
    limit: 1,
    depth: 0,
  });

  const existingCustomer = existingCustomers.docs[0];

  if (!existingCustomer) {
    const createdCustomer = await payload.create({
      collection: "customers",
      data: {
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        addresses: addressesToAdd,
      },
    });

    return createdCustomer.id;
  }

  const { merged, changed } = mergeAddresses(
    (existingCustomer.addresses ?? []) as AddressT[],
    addressesToAdd,
  );

  if (changed) {
    await payload.update({
      collection: "customers",
      id: existingCustomer.id,
      data: { addresses: merged },
    });
  }

  return existingCustomer.id;
}

function buildShippingAddressForOrder(values: CartFormValuesT) {
  if (values.format !== "physical") {
    return undefined;
  }

  return {
    firstName: values.firstName,
    lastName: values.lastName,
    line1: values.shippingLine1,
    line2: values.shippingLine2 || undefined,
    city: values.shippingCity,
    postalCode: values.shippingPostalCode,
    country: values.shippingCountry || DEFAULT_COUNTRY,
  };
}

function buildOrderEmailText(values: CartFormValuesT, order: {
  orderNumber: string;
  quantity: number;
  totalGross: number;
}, product: { title: string; format: string }) {
  return [
    `Zamówienie: ${order.orderNumber}`,
    `Produkt: ${product.title} (${product.format})`,
    `Ilość: ${order.quantity}`,
    `Kwota: ${order.totalGross} PLN`,
    `Klient: ${values.firstName} ${values.lastName} <${values.email}>`,
    values.wantsInvoice ? `Faktura: ${values.companyName} (NIP ${values.nip})` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function createOrder(input: unknown): Promise<CreateOrderResultT> {
  const parsed = cartFormSchema.safeParse(input);

  if (!parsed.success) {
    return invalidOrder("Nieprawidłowe dane");
  }

  const values = parsed.data;

  const payload = await getPayload({ config });
  const product = await findActiveProduct(payload, values);

  if ("ok" in product) {
    return product;
  }

  const addressesToAdd = buildAddressesToAdd(values);
  const customerId = await findOrCreateCustomer(payload, values, addressesToAdd);
  const shippingAddress = buildShippingAddressForOrder(values);

  // Payload's generated create type demands hook-populated fields (orderNumber,
  // totalGross, etc.) which are set by beforeChange hooks. The cast is the documented
  // workaround; same pattern in src/scripts/seed-orders.ts.
  const order = await payload.create({
    collection: "orders",
    data: {
      product: product.id,
      customer: customerId,
      quantity: values.format === "physical" ? values.quantity : 1,
      wantsInvoice: values.wantsInvoice,
      shippingAddress,
    } as never,
  });

  await sendEmail({
    to: ENV.EMAIL_TO,
    subject: `Nowe zamówienie ${order.orderNumber}`,
    text: buildOrderEmailText(values, order, product),
  });

  return {
    ok: true,
    orderNumber: order.orderNumber,
    totalGross: order.totalGross,
  };
}
