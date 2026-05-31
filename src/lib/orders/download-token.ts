import type { Payload } from "payload";
import { generateDownloadToken } from "@/lib/checkout/billing";
import { asPopulated } from "@/lib/payload/as-populated";
import type {
  Customer,
  DigitalAsset,
  Media,
  Order,
  Product,
} from "@/payload-types";

export { generateDownloadToken };

export const TOKEN_REGEX = /^[0-9a-f]{48}$/;
export const DOWNLOAD_TTL_HOURS = 72;
export const DOWNLOAD_TTL_MS = DOWNLOAD_TTL_HOURS * 60 * 60 * 1000;

export type DownloadStatusT = "ready" | "expired" | "not_paid" | "not_found";

export function nextDownloadExpiry(): Date {
  return new Date(Date.now() + DOWNLOAD_TTL_MS);
}

// Wraps an Order with its already-narrowed relations. Payload returns
// relationships as `T | number` depending on `depth`; doing the narrowing
// here once means callers can read `product` / `customer` / `file`
// directly without re-checking `typeof === "object"` at every site.
// Whichever fields aren't populated at the requested depth are `null`.
export type DownloadOrderT = {
  order: Order;
  product: Product | null;
  customer: Customer | null;
  file: DigitalAsset | Media | null;
};

export async function findOrderByDownloadToken(
  payload: Payload,
  token: string,
  depth = 1,
): Promise<DownloadOrderT | null> {
  if (!TOKEN_REGEX.test(token)) return null;
  const result = await payload.find({
    collection: "orders",
    where: { downloadToken: { equals: token } },
    limit: 1,
    depth,
  });
  const order = result.docs[0];
  if (!order) return null;

  const product = asPopulated(order.product);
  const customer = asPopulated(order.customer);
  const file = product ? asPopulated<DigitalAsset | Media>(product.file) : null;

  return { order, product, customer, file };
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
