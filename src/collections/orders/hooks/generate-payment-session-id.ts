import { randomUUID } from "crypto";
import type { CollectionBeforeChangeHook } from "payload";

// P24 requires each transaction sessionId to be globally unique for the lifetime
// of the merchant account — re-registering one it has already seen fails with
// "Id sesji zduplikowane" (HTTP 400). Our orderNumber is count-derived
// (orders-this-year + 1) and reused after deletions, so it cannot serve as the
// sessionId. Mint a dedicated value here instead: the orderNumber prefix keeps
// the P24 panel readable, the random UUID guarantees the value is never reused.
// Runs after generateOrderNumber, so data.orderNumber is already populated.
export const generatePaymentSessionId: CollectionBeforeChangeHook = ({
  data,
  operation,
}) => {
  if (operation !== "create") return data;
  if (data.paymentSessionId) return data;

  data.paymentSessionId = `${data.orderNumber ?? "order"}-${randomUUID()}`;
  return data;
};
