/**
 * POST /api/download/<token>/resend — re-sends the download link.
 *
 * Always returns 200 ok so the endpoint can't be used as a token-existence oracle.
 * If the current link is still valid we re-send the same token; if it's expired or
 * out of attempts we rotate to a fresh token (and reset the attempt count).
 *
 * The 60s in-memory cooldown is best-effort: on Vercel each function instance has
 * its own map, so a determined attacker can bypass it by hitting cold instances.
 * Move to KV/Redis if abuse is observed.
 */

import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import {
  TOKEN_REGEX,
  findOrderByDownloadToken,
  generateDownloadToken,
  nextDownloadExpiry,
  resolveDownloadState,
} from "@/lib/orders/download-token";
import { sendDownloadEmail } from "@/lib/orders/send-download-email";

export const dynamic = "force-dynamic";

const RESEND_COOLDOWN_MS = 60_000;
const recentResends = new Map<string, number>();

type RouteContextT = { params: Promise<{ token: string }> };

export async function POST(
  _req: Request,
  ctx: RouteContextT,
): Promise<Response> {
  const { token } = await ctx.params;
  const ok = () => NextResponse.json({ ok: true });

  if (!TOKEN_REGEX.test(token)) return ok();

  const lastSentAt = recentResends.get(token);
  if (lastSentAt && Date.now() - lastSentAt < RESEND_COOLDOWN_MS) return ok();

  const payload = await getPayload({ config });
  const order = await findOrderByDownloadToken(payload, token, 1);
  if (!order || order.paymentStatus !== "paid") return ok();

  const customer = typeof order.customer === "object" ? order.customer : null;
  if (!customer?.email) return ok();

  const state = resolveDownloadState(order);
  const needsRotation = state.status === "expired" || state.status === "exhausted";

  let nextToken = order.downloadToken ?? token;
  let nextExpiresAt = state.expiresAt ?? new Date();

  if (needsRotation) {
    nextToken = generateDownloadToken();
    nextExpiresAt = nextDownloadExpiry();
    await payload.update({
      collection: "orders",
      id: order.id,
      data: {
        downloadToken: nextToken,
        downloadExpiresAt: nextExpiresAt.toISOString(),
        downloadCount: 0,
        resendCount: (order.resendCount ?? 0) + 1,
      },
      context: { skipFulfillment: true },
    });
  } else {
    await payload.update({
      collection: "orders",
      id: order.id,
      data: { resendCount: (order.resendCount ?? 0) + 1 },
      context: { skipFulfillment: true },
    });
  }

  recentResends.set(token, Date.now());

  await sendDownloadEmail({
    customerEmail: customer.email,
    customerFirstName: customer.firstName,
    downloadToken: nextToken,
    downloadExpiresAt: nextExpiresAt,
    downloadLimit: state.limit,
  });

  return ok();
}
