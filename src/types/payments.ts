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
};

export type RegisterTransactionResultT = {
  token: string;
  redirectUrl: string;
};

export type VerifyTransactionInputT = {
  sessionId: string;
  orderId: number;
  amountGrosze: number;
};

export type P24TransactionT = {
  sessionId: string;
  orderId: number;
  amount: number;
  status: number;
};
