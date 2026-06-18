import { createHmac, randomBytes } from "node:crypto";

type VatBreakdownT = { priceNet: number; vatAmount: number };

export function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100;
}

export function calcVat(
  priceGross: number,
  vatRatePercent: number,
): VatBreakdownT {
  if (priceGross === 0) return { priceNet: 0, vatAmount: 0 };
  const priceNet = roundMoney(priceGross / (1 + vatRatePercent / 100));
  const vatAmount = roundMoney(priceGross - priceNet);
  return { priceNet, vatAmount };
}

export function generateDownloadToken(): string {
  return randomBytes(24).toString("hex");
}

// Deterministic initial download token, keyed by order id. Concurrent
// fulfillment paths (P24 webhook hook + the buyer's processing-page render)
// both derive THIS value, so a racing overwrite writes identical bytes — the
// emailed link can never diverge from the stored one. Regenerate stays random
// (single-threaded admin action). 24 bytes → 48 hex, matching TOKEN_REGEX.
export function deriveDownloadToken(orderId: number, secret: string): string {
  return createHmac("sha256", secret)
    .update(`download:${orderId}`)
    .digest("hex")
    .slice(0, 48);
}

export function formatOrderNumber(year: number, sequence: number): string {
  return `${String(sequence).padStart(4, "0")}-${year}`;
}
