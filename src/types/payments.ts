/* Przelewy24 contract — request/response shapes P24 exchanges over its REST API.
   Pure types, no logic. Transaction-status codes live in
   src/lib/payments/transaction-status.ts (a runtime value, not a type). */

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
