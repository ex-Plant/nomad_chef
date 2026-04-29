import { randomBytes } from "node:crypto";

export type VatBreakdownT = { priceNet: number; vatAmount: number };

export function calcVat(priceGross: number, vatRate: number): VatBreakdownT {
  const priceNet = Math.round(priceGross / (1 + vatRate));
  const vatAmount = priceGross - priceNet;
  return { priceNet, vatAmount };
}

export function generateDownloadToken(): string {
  return randomBytes(24).toString("hex");
}

export function formatOrderNumber(year: number, sequence: number): string {
  return `NC-${year}-${String(sequence).padStart(4, "0")}`;
}
