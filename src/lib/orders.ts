"use server";

import { cartFormSchema, type CartFormValuesT } from "@/lib/cart-schema";

export type AddressT = {
  companyName?: string;
  nip?: string;
  line1: string;
  line2?: string;
  city: string;
  postalCode: string;
  country: string;
};

export function mergeAddresses(
  existing: AddressT[],
  toAdd: AddressT[],
): { merged: AddressT[]; changed: boolean } {
  const merged = [...existing];
  let changed = false;
  for (const next of toAdd) {
    const idx = merged.findIndex(
      (a) => a.line1 === next.line1 && a.postalCode === next.postalCode,
    );
    if (idx === -1) {
      merged.push(next);
      changed = true;
      continue;
    }
    if (next.nip && !merged[idx].nip) {
      merged[idx] = {
        ...merged[idx],
        companyName: next.companyName ?? merged[idx].companyName,
        nip: next.nip,
      };
      changed = true;
    }
  }
  return { merged, changed };
}

function buildAddressesToAdd(v: CartFormValuesT): AddressT[] {
  const addresses: AddressT[] = [];
  const shipping: AddressT | null =
    v.format === "physical"
      ? {
          line1: v.shippingLine1,
          line2: v.shippingLine2 || undefined,
          city: v.shippingCity,
          postalCode: v.shippingPostalCode,
          country: v.shippingCountry || "PL",
        }
      : null;
  const invoice: AddressT | null = v.wantsInvoice
    ? {
        companyName: v.companyName,
        nip: v.nip,
        line1:
          v.format === "physical" && v.useShippingAsInvoice
            ? v.shippingLine1
            : v.invoiceLine1,
        line2:
          (v.format === "physical" && v.useShippingAsInvoice
            ? v.shippingLine2
            : v.invoiceLine2) || undefined,
        city:
          v.format === "physical" && v.useShippingAsInvoice
            ? v.shippingCity
            : v.invoiceCity,
        postalCode:
          v.format === "physical" && v.useShippingAsInvoice
            ? v.shippingPostalCode
            : v.invoicePostalCode,
        country:
          (v.format === "physical" && v.useShippingAsInvoice
            ? v.shippingCountry
            : v.invoiceCountry) || "PL",
      }
    : null;
  if (
    v.format === "physical" &&
    v.wantsInvoice &&
    v.useShippingAsInvoice &&
    invoice
  ) {
    addresses.push(invoice);
    return addresses;
  }
  if (shipping) addresses.push(shipping);
  if (invoice) addresses.push(invoice);
  return addresses;
}

type CreateOrderResultT =
  | { ok: true; orderNumber: string; totalGross: number }
  | { ok: false; error: string };

export async function createOrder(input: unknown): Promise<CreateOrderResultT> {
  const parsed = cartFormSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Nieprawidłowe dane" };
  const v = parsed.data;

  // Lazy imports keep module-level evaluation pure so unit tests for
  // `mergeAddresses` can import this file without touching env/payload/email.
  const { getPayload } = await import("payload");
  const { default: config } = await import("@payload-config");
  const { ENV } = await import("@/config/env");
  const { sendEmail } = await import("@/lib/email");

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
    orderNumber: order.orderNumber!,
    totalGross: order.totalGross,
  };
}
