/**
 * Builds a P24 urlStatus notification with a correct (or deliberately broken)
 * SHA-384 sign, mirroring src/lib/payments/p24.ts exactly. The field order in
 * the signed object MUST match the app (JSON.stringify preserves insertion
 * order) or the recomputed sign won't match.
 */
import { createHash } from "node:crypto";

// Worker processes may not re-run the config's loadEnvFile, so guarantee the
// P24 creds are present here before we read them.
try {
  process.loadEnvFile(".env");
} catch {
  // env injected another way
}

const CRC = process.env.P24_CRC ?? "";
const MERCHANT_ID = Number(process.env.P24_MERCHANT_ID);
const POS_ID = Number(process.env.P24_POS_ID);

export type NotificationInputT = {
  sessionId: string;
  amount: number; // grosze
  orderId?: number;
  methodId?: number;
  statement?: string;
  invalidSign?: boolean;
};

export function buildNotification(input: NotificationInputT) {
  const {
    sessionId,
    amount,
    orderId = 123456,
    methodId = 1,
    statement = "test",
    invalidSign = false,
  } = input;

  const signed = {
    merchantId: MERCHANT_ID,
    posId: POS_ID,
    sessionId,
    amount,
    originAmount: amount,
    currency: "PLN",
    orderId,
    methodId,
    statement,
    crc: CRC,
  };
  const sign = createHash("sha384")
    .update(JSON.stringify(signed))
    .digest("hex");

  return {
    merchantId: MERCHANT_ID,
    posId: POS_ID,
    sessionId,
    amount,
    originAmount: amount,
    currency: "PLN",
    orderId,
    methodId,
    statement,
    sign: invalidSign ? "deadbeefdeadbeef" : sign,
  };
}

// PLN → grosze, matching plnToGrosze (0.1 → 10).
export function toGrosze(pln: number): number {
  return Math.round(pln * 100);
}
