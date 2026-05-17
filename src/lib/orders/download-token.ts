import type { Payload } from "payload";
import { generateDownloadToken } from "@/lib/billing";
import type { Order } from "@/payload-types";

export { generateDownloadToken };

export const TOKEN_REGEX = /^[0-9a-f]{48}$/;
export const DOWNLOAD_TTL_DAYS = 30;
export const DOWNLOAD_TTL_MS = DOWNLOAD_TTL_DAYS * 24 * 60 * 60 * 1000;
export const DEFAULT_DOWNLOAD_LIMIT = 5;

export type DownloadStatusT =
  | "ready"
  | "expired"
  | "exhausted"
  | "not_paid"
  | "not_found";

export function nextDownloadExpiry(): Date {
  return new Date(Date.now() + DOWNLOAD_TTL_MS);
}

export async function findOrderByDownloadToken(
  payload: Payload,
  token: string,
  depth = 1,
): Promise<Order | null> {
  if (!TOKEN_REGEX.test(token)) return null;
  const result = await payload.find({
    collection: "orders",
    where: { downloadToken: { equals: token } },
    limit: 1,
    depth,
  });
  return result.docs[0] ?? null;
}

export type DownloadStateT = {
  status: DownloadStatusT;
  limit: number;
  count: number;
  attemptsRemaining: number;
  expiresAt: Date | null;
};

export function resolveDownloadState(order: Order | null): DownloadStateT {
  const limit = order?.downloadLimit ?? DEFAULT_DOWNLOAD_LIMIT;
  const count = order?.downloadCount ?? 0;
  const expiresAt = order?.downloadExpiresAt
    ? new Date(order.downloadExpiresAt)
    : null;
  const base = { limit, count, attemptsRemaining: 0, expiresAt };

  if (!order) return { ...base, status: "not_found" };
  if (order.paymentStatus !== "paid") return { ...base, status: "not_paid" };
  if (!expiresAt || expiresAt < new Date())
    return { ...base, status: "expired" };
  if (count >= limit) return { ...base, status: "exhausted" };
  return { ...base, status: "ready", attemptsRemaining: limit - count };
}
