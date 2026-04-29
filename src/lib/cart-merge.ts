import type { CartFormValuesT } from "@/lib/cart-schema";

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

export function buildAddressesToAdd(v: CartFormValuesT): AddressT[] {
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
