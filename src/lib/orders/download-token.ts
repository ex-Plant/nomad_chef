import type { Payload } from "payload";
import { generateDownloadToken } from "@/lib/billing";
import type { Order } from "@/payload-types";

export { generateDownloadToken };

export const TOKEN_REGEX = /^[0-9a-f]{48}$/;
export const DOWNLOAD_TTL_HOURS = 24;
export const DOWNLOAD_TTL_MS = DOWNLOAD_TTL_HOURS * 60 * 60 * 1000;

export type DownloadStatusT = "ready" | "expired" | "not_paid" | "not_found";

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
  expiresAt: Date | null;
};

export function resolveDownloadState(order: Order | null): DownloadStateT {
  const expiresAt = order?.downloadExpiresAt
    ? new Date(order.downloadExpiresAt)
    : null;

  if (!order) return { status: "not_found", expiresAt };
  if (order.paymentStatus !== "paid") return { status: "not_paid", expiresAt };
  if (!expiresAt || expiresAt < new Date()) {
    return { status: "expired", expiresAt };
  }
  return { status: "ready", expiresAt };
}
