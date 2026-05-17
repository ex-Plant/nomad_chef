/**
 * POST /api/download/<token>/confirm-delivery
 *
 * The customer clicked "Tak, dziękuję" after downloading the file.
 * Flips the order's fulfillmentStatus to "delivered". Token-gated
 * (same model as the file route); always returns 200 to avoid leaking
 * which tokens exist.
 */

import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import {
  TOKEN_REGEX,
  findOrderByDownloadToken,
} from "@/lib/orders/download-token";

export const dynamic = "force-dynamic";

type RouteContextT = { params: Promise<{ token: string }> };

export async function POST(
  _req: Request,
  ctx: RouteContextT,
): Promise<Response> {
  const { token } = await ctx.params;
  const ok = () => NextResponse.json({ ok: true });

  if (!TOKEN_REGEX.test(token)) return ok();

  const payload = await getPayload({ config });
  const found = await findOrderByDownloadToken(payload, token, 0);
  if (!found || found.order.paymentStatus !== "paid") return ok();

  const { order } = found;
  if (order.fulfillmentStatus !== "delivered") {
    await payload.update({
      collection: "orders",
      id: order.id,
      data: { fulfillmentStatus: "delivered" },
      context: { skipFulfillment: true },
    });
  }

  return ok();
}
