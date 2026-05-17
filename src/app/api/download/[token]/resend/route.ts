/**
 * POST /api/download/<token>/resend
 *
 * Sends the download link to the customer's email again. Two scenarios:
 *
 *   A) The link is still valid (paid, not expired, attempts left).
 *      → Re-send the SAME token. Just bumps `resendCount`. This is the
 *        "I lost the email" recovery path.
 *
 *   B) The link is dead (expired OR all 5 attempts used).
 *      → Generate a NEW token, reset `downloadCount` to 0, push the
 *        expiry 30 days out, bump `resendCount`, and email the new link.
 *        Old token becomes useless.
 *
 * SECURITY NOTE — "always 200 ok"
 * Every failure path returns `{ ok: true }` instead of an honest error.
 * Reason: this endpoint takes an opaque token as input and lives at a
 * predictable URL. If we returned 404 for unknown tokens and 200 for
 * real ones, an attacker could brute-force tokens and learn which exist.
 * By returning the same response for "sent" / "no order" / "not paid"
 * / "no email" / "cooldown active", we leak nothing.
 *
 * COOLDOWN — `recentResends`
 * An in-memory Map keyed by token holds the timestamp of the last send,
 * so spamming the button only mails once per minute. Caveats:
 *   - This map is per-process. On Vercel, multiple cold function
 *     instances each have their own map, so a determined attacker could
 *     bypass it. A future hardening would move this to KV/Redis.
 *   - The map grows unbounded over the lifetime of a process. For our
 *     traffic profile (few resends per day) this is fine; if it ever
 *     matters, evict entries older than the cooldown.
 */

import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { generateDownloadToken } from "@/lib/billing";
import { sendDownloadEmail } from "@/lib/orders/send-download-email";

export const dynamic = "force-dynamic";

const TOKEN_REGEX = /^[0-9a-f]{48}$/;
const DOWNLOAD_TTL_DAYS = 30;
// 60s between resends per token. Keeps button-mashers from triggering
// repeated emails.
const RESEND_COOLDOWN_MS = 60_000;
// Map<token, last-send-timestamp-ms>. See "COOLDOWN" note above.
const recentResends = new Map<string, number>();

type RouteContextT = { params: Promise<{ token: string }> };

export async function POST(
  _req: Request,
  ctx: RouteContextT,
): Promise<Response> {
  const { token } = await ctx.params;

  // Always answer ok to avoid revealing which tokens exist.
  if (!TOKEN_REGEX.test(token)) return NextResponse.json({ ok: true });

  // Cooldown check — silently no-op if hit too recently.
  const lastSentAt = recentResends.get(token);
  if (lastSentAt && Date.now() - lastSentAt < RESEND_COOLDOWN_MS) {
    return NextResponse.json({ ok: true });
  }

  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "orders",
    where: { downloadToken: { equals: token } },
    limit: 1,
    depth: 1,
  });

  // No matching order, or order isn't paid yet → pretend success.
  const order = result.docs[0];
  if (!order || order.paymentStatus !== "paid") {
    return NextResponse.json({ ok: true });
  }

  // We need the customer's email to send anything. Depth:1 should give
  // us the populated customer relation.
  const customer = typeof order.customer === "object" ? order.customer : null;
  if (!customer?.email) return NextResponse.json({ ok: true });

  // Decide which scenario we're in.
  const expiresAt = order.downloadExpiresAt
    ? new Date(order.downloadExpiresAt)
    : null;
  const limit = order.downloadLimit ?? 5;
  const count = order.downloadCount ?? 0;
  const isExpired = !expiresAt || expiresAt < new Date();
  const isExhausted = count >= limit;

  // Defaults for scenario A (re-send same token, same expiry).
  let nextToken = order.downloadToken ?? token;
  let nextExpiresAt = expiresAt ?? new Date();

  if (isExpired || isExhausted) {
    // Scenario B — rotate.
    nextToken = generateDownloadToken();
    nextExpiresAt = new Date(
      Date.now() + DOWNLOAD_TTL_DAYS * 24 * 60 * 60 * 1000,
    );
    await payload.update({
      collection: "orders",
      id: order.id,
      data: {
        downloadToken: nextToken,
        downloadExpiresAt: nextExpiresAt.toISOString(),
        // Reset attempts so the customer has a full 5 again.
        downloadCount: 0,
        resendCount: (order.resendCount ?? 0) + 1,
      },
      // skipFulfillment so the order hook doesn't try to email AGAIN.
      // (We do the email ourselves below.)
      context: { skipFulfillment: true },
    });
  } else {
    // Scenario A — link still works, just record that they asked again.
    await payload.update({
      collection: "orders",
      id: order.id,
      data: { resendCount: (order.resendCount ?? 0) + 1 },
      context: { skipFulfillment: true },
    });
  }

  // Record both the old token AND (if rotated) the new one in the
  // cooldown map. Otherwise a rapid resend → use-new-link → resend cycle
  // could bypass the rate limit.
  recentResends.set(token, Date.now());
  if (nextToken !== token) recentResends.set(nextToken, Date.now());

  // Send the email. Shared helper with the first-delivery flow so the
  // copy and layout stay in sync.
  await sendDownloadEmail({
    customerEmail: customer.email,
    customerFirstName: customer.firstName,
    downloadToken: nextToken,
    downloadExpiresAt: nextExpiresAt,
    downloadLimit: limit,
  });

  return NextResponse.json({ ok: true });
}
