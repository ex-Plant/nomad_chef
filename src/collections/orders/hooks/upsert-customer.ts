import type { CollectionBeforeChangeHook } from "payload";

type BuyerInputT = {
  _buyerEmail?: string;
  _buyerFirstName?: string;
  _buyerLastName?: string;
  _buyerAddress?: {
    line1: string;
    line2?: string;
    city: string;
    postalCode: string;
    country: string;
  };
};

export const upsertCustomer: CollectionBeforeChangeHook = async ({ data, req, operation }) => {
  if (operation !== "create") return data;
  const buyer = data as BuyerInputT;
  const email = buyer._buyerEmail;
  if (!email) return data;

  const existing = await req.payload.find({
    collection: "customers",
    where: { email: { equals: email } },
    limit: 1,
    depth: 0,
  });

  let customerId: string | number;
  if (existing.docs[0]) {
    customerId = existing.docs[0].id;
    if (buyer._buyerAddress) {
      const current = existing.docs[0];
      const hasAddress = current.addresses?.some(
        (a) => a.line1 === buyer._buyerAddress!.line1 && a.postalCode === buyer._buyerAddress!.postalCode,
      );
      if (!hasAddress) {
        await req.payload.update({
          collection: "customers",
          id: customerId,
          data: {
            addresses: [...(current.addresses ?? []), buyer._buyerAddress],
          },
        });
      }
    }
  } else {
    const created = await req.payload.create({
      collection: "customers",
      data: {
        email,
        firstName: buyer._buyerFirstName,
        lastName: buyer._buyerLastName,
        addresses: buyer._buyerAddress ? [buyer._buyerAddress] : undefined,
      },
    });
    customerId = created.id;
  }

  data.customer = customerId;
  delete (data as Record<string, unknown>)._buyerEmail;
  delete (data as Record<string, unknown>)._buyerFirstName;
  delete (data as Record<string, unknown>)._buyerLastName;
  delete (data as Record<string, unknown>)._buyerAddress;

  return data;
};
