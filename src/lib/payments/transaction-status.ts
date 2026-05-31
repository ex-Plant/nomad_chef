// Transaction statuses P24 returns from GET /transaction/by/sessionId. P24 only
// PUSHes the urlStatus webhook for a SUCCESSFUL payment, so this PULL is the only
// way to learn that a payment failed, was cancelled, or was abandoned.
export const P24_TRANSACTION_STATUS = {
  noPayment: 0, // no payment recorded YET — ambiguous: failed/cancelled card OR
  // a traditional transfer not yet landed. NOT safe to treat as terminal.
  advance: 1, // partial / advance payment
  paid: 2, // paid in full
  returned: 3, // refunded
} as const;
