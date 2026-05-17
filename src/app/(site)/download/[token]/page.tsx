/**
 * /download/<token> — the landing page the customer reaches from the email.
 *
 * The page itself is a SERVER COMPONENT — by the time the browser sees
 * any HTML, we already know if the token is valid, expired, exhausted,
 * etc. That status is passed as a prop to the client `<DownloadCard />`,
 * which renders the right UI variant.
 *
 * The actual file streaming happens in /api/download/<token>/file when
 * the user clicks "Download". This page only DISPLAYS state — it never
 * mutates the order.
 */

import { getPayload } from "payload";
import config from "@payload-config";
import { DownloadCard, type DownloadStatusT } from "./download-card";

// Read fresh on every request — token state changes (counts, expiry) and
// must never be cached.
export const dynamic = "force-dynamic";

// In Next 15, dynamic route params are an async value, so we type as Promise.
type PagePropsT = { params: Promise<{ token: string }> };

// Tokens come from `crypto.randomBytes(24).toString("hex")` → exactly 48
// lowercase hex chars. Anything else can't be a real token — reject early
// so we don't even hit the DB with bogus input.
const TOKEN_REGEX = /^[0-9a-f]{48}$/;

export default async function DownloadPage({ params }: PagePropsT) {
  const { token } = await params;

  // All of the "is this token usable right now?" logic happens here on
  // the server. The client UI just renders whichever state we picked.
  const { status, attemptsRemaining, productTitle } =
    await resolveStatus(token);

  return (
    <main className="bg-warm-white text-off-black min-h-screen px-6 py-24">
      <div className="mx-auto max-w-xl">
        <DownloadCard
          token={token}
          status={status}
          attemptsRemaining={attemptsRemaining}
          productTitle={productTitle}
        />
      </div>
    </main>
  );
}

type ResolvedT = {
  status: DownloadStatusT;
  attemptsRemaining: number;
  productTitle: string | null;
};

/**
 * Determines which UI state the download card should render.
 *
 * Order of checks matters: each `if` rules out one failure mode before
 * the next is considered. By the time we return "ready" we know:
 *   - the token shape is valid
 *   - an order with that token exists
 *   - the order is paid
 *   - the link has not expired
 *   - the download attempts limit has not been hit
 */
async function resolveStatus(token: string): Promise<ResolvedT> {
  // Cheap early reject — saves a DB roundtrip on garbage input.
  if (!TOKEN_REGEX.test(token)) {
    return { status: "not_found", attemptsRemaining: 0, productTitle: null };
  }

  const payload = await getPayload({ config });
  // `find` with `where` returns an array; we expect 0 or 1 because tokens
  // are unique. `depth: 1` populates the product relation one level deep
  // so we can read `product.title` below.
  const result = await payload.find({
    collection: "orders",
    where: { downloadToken: { equals: token } },
    limit: 1,
    depth: 1,
  });
  const order = result.docs[0];
  if (!order) {
    return { status: "not_found", attemptsRemaining: 0, productTitle: null };
  }

  // `depth: 1` should give us the product object, but we still narrow:
  // when depth is 0 (or the field is missing) `product` would be just an id.
  const product = typeof order.product === "object" ? order.product : null;
  const productTitle = product?.title ?? null;

  // Edge case: a token exists but payment hasn't cleared yet. Could happen
  // if an admin manually generated a token, or in race conditions.
  if (order.paymentStatus !== "paid") {
    return { status: "not_paid", attemptsRemaining: 0, productTitle };
  }

  // Token TTL check — `downloadExpiresAt` is an ISO string when present.
  const expiresAt = order.downloadExpiresAt
    ? new Date(order.downloadExpiresAt)
    : null;
  if (!expiresAt || expiresAt < new Date()) {
    return { status: "expired", attemptsRemaining: 0, productTitle };
  }

  // Attempts cap — prevents a leaked link from being downloaded infinitely.
  // Default of 5 matches the field's `defaultValue` in the Orders collection.
  const limit = order.downloadLimit ?? 5;
  const count = order.downloadCount ?? 0;
  if (count >= limit) {
    return { status: "exhausted", attemptsRemaining: 0, productTitle };
  }

  return {
    status: "ready",
    attemptsRemaining: limit - count,
    productTitle,
  };
}
