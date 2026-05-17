import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { generateDownloadToken } from "@/lib/billing";
import { sendDownloadEmail } from "@/lib/orders/send-download-email";

export const dynamic = "force-dynamic";

const TOKEN_REGEX = /^[0-9a-f]{48}$/;
const DOWNLOAD_TTL_DAYS = 30;
const RESEND_COOLDOWN_MS = 60_000;
const recentResends = new Map<string, number>();

type RouteContextT = { params: Promise<{ token: string }> };

export async function POST(
  _req: Request,
  ctx: RouteContextT,
): Promise<Response> {
  const { token } = await ctx.params;

  // Always answer ok to avoid revealing which tokens exist.
  if (!TOKEN_REGEX.test(token)) return NextResponse.json({ ok: true });

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

  const order = result.docs[0];
  if (!order || order.paymentStatus !== "paid") {
    return NextResponse.json({ ok: true });
  }

  const customer = typeof order.customer === "object" ? order.customer : null;
  if (!customer?.email) return NextResponse.json({ ok: true });

  const expiresAt = order.downloadExpiresAt
    ? new Date(order.downloadExpiresAt)
    : null;
  const limit = order.downloadLimit ?? 5;
  const count = order.downloadCount ?? 0;
  const isExpired = !expiresAt || expiresAt < new Date();
  const isExhausted = count >= limit;

  let nextToken = order.downloadToken ?? token;
  let nextExpiresAt = expiresAt ?? new Date();

  if (isExpired || isExhausted) {
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
  if (nextToken !== token) recentResends.set(nextToken, Date.now());

  await sendDownloadEmail({
    customerEmail: customer.email,
    customerFirstName: customer.firstName,
    downloadToken: nextToken,
    downloadExpiresAt: nextExpiresAt,
    downloadLimit: limit,
  });

  return NextResponse.json({ ok: true });
}
