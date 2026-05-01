import type { Payload, PayloadRequest } from "payload";
import { mergeAddresses, type AddressT } from "@/lib/cart-merge";
import type { CartFormValuesT } from "@/lib/cart-schema";

type FindOrCreateCustomerArgsT = {
  payload: Payload;
  values: CartFormValuesT;
  addressesToAdd: AddressT[];
  req: Partial<PayloadRequest>;
};

export async function findOrCreateCustomer({
  payload,
  values,
  addressesToAdd,
  req,
}: FindOrCreateCustomerArgsT): Promise<string | number> {
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
    addressesToAdd,
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
