/**
 * GET /api/download/<token>/file — streams the gated ebook bytes.
 *
 * We proxy bytes through this route rather than redirecting to the upstream
 * blob URL so the attempts limit can't be bypassed by re-using the direct URL.
 * Increment happens after the upstream `fetch` succeeds but before streaming
 * completes — a client that aborts mid-download still consumes an attempt.
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
  exhausted: {
    status: 429,
    message:
      "Wykorzystano limit pobrań. Skontaktuj się z nami, aby otrzymać nowy link.",
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
  // `state.status === "ready"` implies `order` is non-null.
  if (!order) return errorResponse("Link nieaktywny.", 404);

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
    data: {
      downloadCount: state.count + 1,
      lastDownloadAt: new Date().toISOString(),
    },
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
