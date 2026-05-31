import type { CartFormValuesT } from "@/lib/cart/cart-schema";

export type AddressT = {
  companyName?: string;
  nip?: string;
  line1: string;
  line2?: string;
  city: string;
  postalCode: string;
  country: string;
};

const DEFAULT_COUNTRY = "PL";

function isSameAddress(a: AddressT, b: AddressT): boolean {
  return a.line1 === b.line1 && a.postalCode === b.postalCode;
}

function mergeInvoiceDetails(existing: AddressT, incoming: AddressT): AddressT {
  if (!incoming.nip || existing.nip) {
    return existing;
  }

  return {
    ...existing,
    companyName: incoming.companyName ?? existing.companyName,
    nip: incoming.nip,
  };
}

export function mergeAddresses(
  existing: AddressT[],
  toAdd: AddressT[],
): { merged: AddressT[]; changed: boolean } {
  const merged = [...existing];
  let changed = false;

  for (const next of toAdd) {
    const existingIndex = merged.findIndex((address) =>
      isSameAddress(address, next),
    );

    if (existingIndex === -1) {
      merged.push(next);
      changed = true;
      continue;
    }

    const nextMergedAddress = mergeInvoiceDetails(merged[existingIndex], next);

    if (nextMergedAddress !== merged[existingIndex]) {
      merged[existingIndex] = nextMergedAddress;
      changed = true;
    }
  }

  return { merged, changed };
}

function optionalValue(value: string): string | undefined {
  return value || undefined;
}

function normalizeCountry(country: string): string {
  return country || DEFAULT_COUNTRY;
}

function buildAddress(fields: {
  line1: string;
  line2: string;
  city: string;
  postalCode: string;
  country: string;
  companyName?: string;
  nip?: string;
}): AddressT {
  return {
    companyName: fields.companyName,
    nip: fields.nip,
    line1: fields.line1,
    line2: optionalValue(fields.line2),
    city: fields.city,
    postalCode: fields.postalCode,
    country: normalizeCountry(fields.country),
  };
}

function buildShippingAddress(values: CartFormValuesT): AddressT | null {
  if (values.format !== "physical") {
    return null;
  }

  return buildAddress({
    line1: values.shippingLine1,
    line2: values.shippingLine2,
    city: values.shippingCity,
    postalCode: values.shippingPostalCode,
    country: values.shippingCountry,
  });
}

function buildInvoiceAddress(values: CartFormValuesT): AddressT | null {
  if (!values.wantsInvoice) {
    return null;
  }

  const useShippingAddress =
    values.format === "physical" && values.useShippingAsInvoice;

  return buildAddress({
    companyName: values.companyName,
    nip: values.nip,
    line1: useShippingAddress ? values.shippingLine1 : values.invoiceLine1,
    line2: useShippingAddress ? values.shippingLine2 : values.invoiceLine2,
    city: useShippingAddress ? values.shippingCity : values.invoiceCity,
    postalCode: useShippingAddress
      ? values.shippingPostalCode
      : values.invoicePostalCode,
    country: useShippingAddress
      ? values.shippingCountry
      : values.invoiceCountry,
  });
}

export function buildAddressesToAdd(v: CartFormValuesT): AddressT[] {
  const shipping = buildShippingAddress(v);
  const invoice = buildInvoiceAddress(v);
  const usesShippingAsInvoice =
    v.format === "physical" && v.wantsInvoice && v.useShippingAsInvoice;

  if (usesShippingAsInvoice && invoice) {
    return [invoice];
  }

  const addresses: AddressT[] = [];

  if (shipping) {
    addresses.push(shipping);
  }

  if (invoice) {
    addresses.push(invoice);
  }

  return addresses;
}
