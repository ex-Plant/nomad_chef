/* Przelewy24 contract — request/response shapes and the transaction-status codes
   P24 returns from GET /transaction/by/sessionId. Pure types + constants, no logic. */

export type RegisterTransactionInputT = {
  sessionId: string;
  amountGrosze: number;
  description: string;
  email: string;
  urlReturn: string;
  urlStatus: string;
  currency?: string;
  country?: string;
  language?: string;
};

export type RegisterTransactionResultT = {
  token: string;
  redirectUrl: string;
};

export type VerifyTransactionInputT = {
  sessionId: string;
  orderId: number;
  amountGrosze: number;
  currency?: string;
};

export type P24TransactionT = {
  sessionId: string;
  orderId: number;
  amount: number;
  status: number;
};

// Fields P24 POSTs to the urlStatus webhook for a successful payment.
export type P24NotificationT = {
  merchantId: number;
  posId: number;
  sessionId: string;
  amount: number;
  originAmount: number;
  currency: string;
  orderId: number;
  methodId: number;
  statement: string;
  sign: string;
};

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
