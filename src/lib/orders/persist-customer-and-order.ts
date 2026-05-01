import type { Payload, PayloadRequest } from "payload";
import type { Order, Product } from "@/payload-types";
import { buildAddressesToAdd } from "@/lib/cart-merge";
import type { CartFormValuesT } from "@/lib/cart-schema";
import { findOrCreateCustomer } from "./find-or-create-customer";
import { buildShippingAddressForOrder } from "./build-shipping-address";

const FAILURE_MESSAGE = "Nie udało się zapisać zamówienia. Spróbuj ponownie.";

type PersistArgsT = {
  payload: Payload;
  values: CartFormValuesT;
  product: Product;
};

export type PersistedOrderT = Pick<Order, "id" | "orderNumber" | "totalGross" | "quantity">;

export type PersistResultT =
  | { ok: true; order: PersistedOrderT }
  | { ok: false; error: string };

export async function persistCustomerAndOrder({
  payload,
  values,
  product,
}: PersistArgsT): Promise<PersistResultT> {
  // Wrap customer + order writes in a transaction so a failed order create
  // doesn't leave behind an orphan customer row.
  const transactionID = await payload.db.beginTransaction();
  if (!transactionID) {
    console.error("[createOrder] DB adapter did not return a transaction ID");
    return { ok: false, error: FAILURE_MESSAGE };
  }
  const req: Partial<PayloadRequest> = { transactionID };

  try {
    const customerId = await findOrCreateCustomer({
      payload,
      values,
      addressesToAdd: buildAddressesToAdd(values),
      req,
    });

    // Payload's generated create type demands hook-populated fields (orderNumber,
    // totalGross, etc.) which are filled by beforeChange hooks. The cast is the
    // documented workaround.
    const order = await payload.create({
      collection: "orders",
      req,
      data: {
        product: product.id,
        customer: customerId,
        quantity: values.format === "physical" ? values.quantity : 1,
        wantsInvoice: values.wantsInvoice,
        shippingAddress: buildShippingAddressForOrder(values),
        notes: values.notes || undefined,
      } as never,
    });

    await payload.db.commitTransaction(transactionID);
    return { ok: true, order };
  } catch (err) {
    await payload.db.rollbackTransaction(transactionID);
    console.error("[createOrder] failed to persist order", err);
    return { ok: false, error: FAILURE_MESSAGE };
  }
}
