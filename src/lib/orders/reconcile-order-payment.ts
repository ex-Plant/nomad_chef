import type { Payload } from "payload";
import {
  findTransactionBySessionId,
  verifyTransaction,
} from "@/lib/payments/p24";
import { plnToGrosze } from "@/lib/payments/amount";
import { P24_TRANSACTION_STATUS } from "@/lib/payments/transaction-status";
import { P24_PAYABLE_WINDOW_MS } from "@/config/payments";

export type PaymentOutcomeT = "pending" | "paid" | "failed";

type ReconcileOrderPaymentInputT = {
  readonly payload: Payload;
  readonly order: {
    readonly id: number;
    readonly orderNumber: string;
    readonly paymentSessionId?: string | null;
    readonly totalGross: number;
    readonly createdAt: string;
  };
};

// Reconciles ONE order that is currently `pending` against P24's authoritative
// transaction status. Shared by the in-browser processing-page poll
// (check-payment-outcome.ts) and the daily reconciliation cron
// (app/api/cron/reconcile-payments). P24 only PUSHes its urlStatus webhook for a
// SUCCESSFUL payment, so without this PULL a failed/cancelled/abandoned order
// sits `pending` forever once the buyer leaves the processing page.
//
//   paid (2)       → settle it (amount guard → verify → flip to paid), mirroring
//                    the webhook so the outcome no longer depends on webhook
//                    delivery,
//   no payment (0) → AMBIGUOUS — a failed/cancelled card AND an unpaid-yet
//                    traditional transfer both read 0, and P24's status API can't
//                    tell them apart. Only mark failed once the payable window has
//                    elapsed (transfer can no longer land); before that, keep
//                    pending so we never kill a legitimate deferred transfer.
//                    Recoverable either way: a later success webhook flips it to
//                    paid + fulfils even from failed,
//   otherwise      → still pending; nothing decided yet.
//
// The caller must confirm the order is `pending` first — this only performs the
// P24 PULL and the resulting transition.
export async function reconcileOrderPayment({
  payload,
  order,
}: ReconcileOrderPaymentInputT): Promise<PaymentOutcomeT> {
  // Legacy/pre-paymentSessionId orders can't be reconciled by sessionId — they
  // were never registered under one. Treat as pending; nothing to settle.
  if (!order.paymentSessionId) return "pending";

  const transaction = await findTransactionBySessionId(order.paymentSessionId);
  // No transaction on P24's side yet → nothing decided; keep waiting.
  if (!transaction) return "pending";

  if (transaction.status === P24_TRANSACTION_STATUS.paid) {
    // Amount-tampering guard, same as the webhook: the settled amount must match
    // what we charged before we trust it.
    if (transaction.amount !== plnToGrosze(order.totalGross)) {
      console.error(
        `[p24:reconcile] amount mismatch for ${order.orderNumber}: ` +
          `P24 ${transaction.amount}, expected ${plnToGrosze(order.totalGross)}`,
      );
      return "pending";
    }

    // Funds aren't settled to us until verify succeeds — never mark paid on the
    // status read alone.
    const verified = await verifyTransaction({
      sessionId: order.paymentSessionId,
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
    // still arrive — so keep pending. Only once the window has elapsed, when the
    // transaction can no longer be paid, is `failed` safe to write.
    const ageMs = Date.now() - new Date(order.createdAt).getTime();
    if (ageMs < P24_PAYABLE_WINDOW_MS) return "pending";

    await payload.update({
      collection: "orders",
      id: order.id,
      data: { paymentStatus: "failed" },
    });
    return "failed";
  }

  // advance (1) / returned (3) mid-checkout → leave pending.
  return "pending";
}
