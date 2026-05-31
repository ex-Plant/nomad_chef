import { randomBytes } from "node:crypto";

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

export function formatOrderNumber(year: number, sequence: number): string {
  return `${String(sequence).padStart(4, "0")}-${year}`;
}
