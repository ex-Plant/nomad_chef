"use server";

import { getPayload, type PayloadRequest } from "payload";
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

async function findActiveProduct(payload: PayloadT, values: CartFormValuesT) {
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
    return { ok: false as const, error: "Produkt niedostępny" };
  }

  if (product.format !== values.format) {
    return { ok: false as const, error: "Nieprawidłowy format" };
  }

  return { ok: true as const, product };
}

async function findOrCreateCustomer(
  payload: PayloadT,
  values: CartFormValuesT,
  addressesToAdd: AddressT[],
  req?: Partial<PayloadRequest>
): Promise<string | number> {
  const existingCustomers = await payload.find({
    collection: "customers",
    where: { email: { equals: values.email } },
    limit: 1,
    depth: 0,
    req,
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
      req,
    });

    return createdCustomer.id;
  }

  const { merged, changed } = mergeAddresses(
    (existingCustomer.addresses ?? []) as AddressT[],
    addressesToAdd
  );

  if (changed) {
    await payload.update({
      collection: "customers",
      id: existingCustomer.id,
      data: { addresses: merged },
      req,
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

function buildOrderEmailText(
  values: CartFormValuesT,
  order: {
    orderNumber: string;
    quantity: number;
    totalGross: number;
  },
  product: { title: string; format: string }
) {
  return [
    `Zamówienie: ${order.orderNumber}`,
    `Produkt: ${product.title} (${product.format})`,
    `Ilość: ${order.quantity}`,
    `Kwota: ${order.totalGross} PLN`,
    `Klient: ${values.firstName} ${values.lastName} <${values.email}>`,
    values.wantsInvoice
      ? `Faktura: ${values.companyName} (NIP ${values.nip})`
      : "",
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
  const productResult = await findActiveProduct(payload, values);

  if (!productResult.ok) {
    return productResult;
  }

  const product = productResult.product;
  const addressesToAdd = buildAddressesToAdd(values);
  const shippingAddress = buildShippingAddressForOrder(values);

  // Wrap customer + order writes in a transaction so a failed order create
  // doesn't leave behind an orphan customer row.
  const transactionID = await payload.db.beginTransaction();
  if (!transactionID) {
    console.error("[createOrder] DB adapter did not return a transaction ID");
    return invalidOrder("Nie udało się zapisać zamówienia. Spróbuj ponownie.");
  }
  const req: Partial<PayloadRequest> = { transactionID };

  let order: {
    id: string | number;
    orderNumber: string;
    totalGross: number;
    quantity: number;
  };

  try {
    const customerId = await findOrCreateCustomer(
      payload,
      values,
      addressesToAdd,
      req
    );

    // Payload's generated create type demands hook-populated fields (orderNumber,
    // totalGross, etc.) which are set by beforeChange hooks. The cast is the documented
    // workaround; same pattern in src/scripts/seed-orders.ts.
    order = await payload.create({
      collection: "orders",
      req,
      data: {
        product: product.id,
        customer: customerId,
        quantity: values.format === "physical" ? values.quantity : 1,
        wantsInvoice: values.wantsInvoice,
        shippingAddress,
        notes: values.notes || undefined,
      } as never,
    });

    await payload.db.commitTransaction(transactionID);
  } catch (err) {
    await payload.db.rollbackTransaction(transactionID);
    console.error("[createOrder] failed to persist order", err);
    return invalidOrder("Nie udało się zapisać zamówienia. Spróbuj ponownie.");
  }

  // Best-effort confirmation email. The order is already committed; email failure
  // only affects the email status field, which can be retried manually from admin.
  try {
    await sendEmail({
      to: ENV.EMAIL_TO,
      subject: `Nowe zamówienie ${order.orderNumber}`,
      text: buildOrderEmailText(values, order, product),
    });
    await payload.update({
      collection: "orders",
      id: order.id,
      data: {
        confirmationEmailStatus: "sent",
        confirmationEmailSentAt: new Date().toISOString(),
        confirmationEmailError: null,
      } as never,
    });
  } catch (err) {
    console.error("[createOrder] confirmation email failed", err);
    const message = err instanceof Error ? err.message : String(err);
    await payload
      .update({
        collection: "orders",
        id: order.id,
        data: {
          confirmationEmailStatus: "failed",
          confirmationEmailError: message,
        } as never,
      })
      .catch((updateErr) => {
        console.error("[createOrder] failed to mark email status", updateErr);
      });
  }

  return {
    ok: true,
    orderNumber: order.orderNumber,
    totalGross: order.totalGross,
  };
}
