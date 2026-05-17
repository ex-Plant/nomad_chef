/**
 * GET /api/download/<token>/file — streams the gated ebook bytes.
 * Proxies the upstream blob through this route so the token is enforced.
 */

import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@/payload.config";
import {
  findOrderByDownloadToken,
  resolveDownloadState,
} from "@/lib/orders/download-token";

export const dynamic = "force-dynamic";

type RouteContextT = { params: Promise<{ token: string }> };

const STATUS_TO_HTTP: Record<string, { status: number; message: string }> = {
  not_found: { status: 404, message: "Link nieaktywny." },
  not_paid: { status: 403, message: "Zamówienie nieopłacone." },
  expired: {
    status: 410,
    message: "Link wygasł. Skontaktuj się z nami, aby otrzymać nowy.",
  },
};

function errorResponse(message: string, status: number): Response {
  return NextResponse.json({ error: message }, { status });
}

// Strip CR/LF/quotes so an admin-set filename can't inject response headers.
function sanitizeFilename(name: string): string {
  return name.replace(/[\r\n"]+/g, "_");
}

export async function GET(
  _req: Request,
  ctx: RouteContextT,
): Promise<Response> {
  const { token } = await ctx.params;
  const payload = await getPayload({ config });

  const order = await findOrderByDownloadToken(payload, token, 2);
  const state = resolveDownloadState(order);

  if (state.status !== "ready") {
    const err = STATUS_TO_HTTP[state.status] ?? STATUS_TO_HTTP.not_found;
    return errorResponse(err.message, err.status);
  }
  if (!order) return errorResponse("Link nieaktywny.", 404);

  // Payload relationship fields are typed as `T | number` — at depth=0 they're
  // just the foreign-key id; at depth>=1 they're populated objects. The TS
  // union forces us to narrow before reading properties. We use depth=2 above
  // so both `order.product` and `product.file` are populated; the typeof
  // checks satisfy the type-checker without changing runtime behavior.
  const product = typeof order.product === "object" ? order.product : null;
  const file =
    product && typeof product.file === "object" ? product.file : null;
  if (!product || product.format !== "digital" || !file?.url) {
    return errorResponse("Brak pliku do pobrania.", 500);
  }

  const fileResponse = await fetch(file.url);
  if (!fileResponse.ok || !fileResponse.body) {
    return errorResponse("Nie można pobrać pliku.", 502);
  }

  await payload.update({
    collection: "orders",
    id: order.id,
    data: { lastDownloadAt: new Date().toISOString() },
    context: { skipFulfillment: true },
  });

  const filename = sanitizeFilename(file.filename ?? "ebook.pdf");
  return new Response(fileResponse.body, {
    status: 200,
    headers: {
      "Content-Type": file.mimeType ?? "application/octet-stream",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
