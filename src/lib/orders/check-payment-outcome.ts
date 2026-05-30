"use server";

import { getPayload } from "payload";
import config from "@payload-config";
import { readCheckoutCookie } from "@/lib/checkout-session";
import {
  findTransactionBySessionId,
  verifyTransaction,
  plnToGrosze,
  P24_TRANSACTION_STATUS,
  P24_PAYABLE_WINDOW_MS,
} from "@/lib/payments/p24";

type PaymentOutcomeT = "pending" | "paid" | "failed";

// Called by /checkout/processing while an order sits `pending`. P24 only PUSHes
// the urlStatus webhook for a SUCCESSFUL payment, so without this PULL the page
// can't tell a failed/cancelled payment from a slow success and spins until the
// poll timeout. The order is read from the signed checkout cookie (never a
// client-supplied id), then we ask P24 for the authoritative transaction status:
//
//   paid (2)       → settle it (amount guard → verify → flip to paid), mirroring
//                    the webhook so the in-browser flow no longer depends on
//                    webhook delivery,
//   no payment (0) → AMBIGUOUS — a failed/cancelled card AND an unpaid-yet
//                    traditional transfer both read 0, and P24's status API can't
//                    tell them apart. Only mark failed once the payable window has
//                    elapsed (transfer can no longer land); before that, keep
//                    pending so we never kill a legitimate deferred transfer.
//                    Recoverable either way: a later success webhook flips it to
//                    paid + fulfils even from failed,
//   otherwise      → still pending; keep polling.
export async function checkPaymentOutcome(): Promise<PaymentOutcomeT> {
  const session = await readCheckoutCookie();
  if (!session) return "pending";

  const payload = await getPayload({ config });
  const order = await payload
    .findByID({ collection: "orders", id: session.orderId, depth: 0 })
    .catch(() => null);
  if (!order) return "pending";

  if (order.paymentStatus === "paid") return "paid";
  if (order.paymentStatus === "failed") return "failed";
  if (order.paymentStatus !== "pending") return "pending";

  const transaction = await findTransactionBySessionId(order.orderNumber);
  // No transaction on P24's side yet → nothing decided; keep waiting.
  if (!transaction) return "pending";

  if (transaction.status === P24_TRANSACTION_STATUS.paid) {
    // Amount-tampering guard, same as the webhook: the settled amount must match
    // what we charged before we trust it.
    if (transaction.amount !== plnToGrosze(order.totalGross)) {
      console.error(
        `[p24:outcome] amount mismatch for ${order.orderNumber}: ` +
          `P24 ${transaction.amount}, expected ${plnToGrosze(order.totalGross)}`,
      );
      return "pending";
    }

    // Funds aren't settled to us until verify succeeds — never mark paid on the
    // status read alone.
    const verified = await verifyTransaction({
      sessionId: order.orderNumber,
      orderId: transaction.orderId,
      amountGrosze: transaction.amount,
    });
    if (!verified) return "pending";

    // Flip to paid → digitalFulfillment hook issues the token + download email.
    // Idempotent vs the webhook: whichever settles first wins; the hook guards
    // its own double-fire on the pending→paid transition.
    await payload.update({
      collection: "orders",
      id: order.id,
      data: {
        paymentStatus: "paid",
        paymentRef: String(transaction.orderId),
        paidAt: new Date().toISOString(),
      },
    });
    return "paid";
  }

  if (transaction.status === P24_TRANSACTION_STATUS.noPayment) {
    // Status 0 is ambiguous (failed card vs. transfer not yet landed). Within
    // the payable window we cannot conclude failure — a traditional transfer can
    // still arrive — so keep polling/pending. Only once the window has elapsed,
    // when the transaction can no longer be paid, is `failed` safe to write.
    const ageMs = Date.now() - new Date(order.createdAt).getTime();
    if (ageMs < P24_PAYABLE_WINDOW_MS) return "pending";

    await payload.update({
      collection: "orders",
      id: order.id,
      data: { paymentStatus: "failed" },
    });
    return "failed";
  }

  // advance (1) / returned (3) mid-checkout → leave pending, keep polling.
  return "pending";
}
