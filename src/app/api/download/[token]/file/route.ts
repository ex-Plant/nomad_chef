/**
 * GET /api/download/<token>/file
 *
 * The actual "give me the bytes" endpoint. Triggered when the customer
 * clicks the Download button on /download/<token>.
 *
 * Flow:
 *   1. Validate the token (regex + DB lookup + paid + not expired + has attempts).
 *   2. Resolve the product's stored file URL (currently a Vercel Blob URL
 *      attached via the `media` collection).
 *   3. Stream the bytes through this route. We DO NOT redirect to the
 *      Blob URL — that would leak a permanent direct URL the user could
 *      share forever, bypassing our attempts limit.
 *   4. Increment `downloadCount` and stamp `lastDownloadAt` AFTER we've
 *      successfully started the proxy, so failed fetches don't count.
 *
 * STREAMING (the "Response(fileResponse.body)" pattern):
 * `fileResponse.body` is a ReadableStream. By handing it back to the
 * client as the response body, Node pipes bytes through without loading
 * the whole PDF into memory. Works for a 50MB ebook on a small Vercel
 * function just as well as for a 200KB one.
 */

import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@/payload.config";

export const dynamic = "force-dynamic";

// Dynamic route params arrive as a Promise in Next 15.
type RouteContextT = { params: Promise<{ token: string }> };

// Same shape contract as the download page (48 lowercase hex chars).
const TOKEN_REGEX = /^[0-9a-f]{48}$/;

export async function GET(
  _req: Request,
  ctx: RouteContextT,
): Promise<Response> {
  const { token } = await ctx.params;
  if (!TOKEN_REGEX.test(token)) {
    return errorResponse("Nieprawidłowy link.", 400);
  }

  const payload = await getPayload({ config });

  // `depth: 2` populates the relations TWO levels deep so we can reach
  // `order.product.file.url` (order → product → media file).
  const result = await payload.find({
    collection: "orders",
    where: { downloadToken: { equals: token } },
    limit: 1,
    depth: 2,
  });
  const order = result.docs[0];

  // ---- The same guard rails as the UI page, but enforced server-side.
  // The page might say "ready" but the user could craft a request directly.
  // We re-check here so this endpoint is safe to call independently.
  if (!order) return errorResponse("Link nieaktywny.", 404);
  if (order.paymentStatus !== "paid")
    return errorResponse("Zamówienie nieopłacone.", 403);

  const expiresAt = order.downloadExpiresAt
    ? new Date(order.downloadExpiresAt)
    : null;
  if (!expiresAt || expiresAt < new Date()) {
    // HTTP 410 Gone — the resource existed but is now permanently unavailable.
    return errorResponse(
      "Link wygasł. Skontaktuj się z nami, aby otrzymać nowy.",
      410,
    );
  }

  const limit = order.downloadLimit ?? 5;
  const count = order.downloadCount ?? 0;
  if (count >= limit) {
    // HTTP 429 Too Many Requests fits the "rate limit hit" semantics here.
    return errorResponse(
      "Wykorzystano limit pobrań. Skontaktuj się z nami, aby otrzymać nowy link.",
      429,
    );
  }

  // ---- Resolve the file URL.
  const product = typeof order.product === "object" ? order.product : null;
  if (!product || product.format !== "digital" || !product.file) {
    // 500 because this is a data-integrity problem (product is missing
    // the file an admin should have uploaded), not a user error.
    return errorResponse("Brak pliku do pobrania.", 500);
  }

  // After depth:2, product.file should be an object with `url`, `filename`,
  // `mimeType`. If for any reason it's still just an id, bail.
  const file = typeof product.file === "object" ? product.file : null;
  if (!file?.url) return errorResponse("Plik niedostępny.", 500);

  // Server-side fetch of the actual bytes. Today this URL is public Blob
  // storage; if/when ebooks move to a private collection, this same
  // fetch is the only place that needs updating (add an auth header).
  const fileResponse = await fetch(file.url);
  if (!fileResponse.ok || !fileResponse.body) {
    // 502 Bad Gateway — we tried to forward but the upstream failed.
    return errorResponse("Nie można pobrać pliku.", 502);
  }

  // Increment AFTER we got a successful upstream response. We pass
  // `skipFulfillment: true` so the orders afterChange hook doesn't
  // mistake this for a state transition and try to re-send the email.
  await payload.update({
    collection: "orders",
    id: order.id,
    data: {
      downloadCount: count + 1,
      lastDownloadAt: new Date().toISOString(),
    },
    context: { skipFulfillment: true },
  });

  // Stream the body straight through. By using the upstream `body` as
  // ours, we avoid `await response.arrayBuffer()` which would buffer the
  // whole file in memory.
  const filename = file.filename ?? "ebook.pdf";
  return new Response(fileResponse.body, {
    status: 200,
    headers: {
      "Content-Type": file.mimeType ?? "application/octet-stream",
      // `inline` lets the browser preview PDFs in-tab; change to
      // `attachment` to force a "Save as" dialog instead.
      "Content-Disposition": `inline; filename="${filename}"`,
      // Never let a CDN or browser cache the response — the file is gated
      // by the token and must hit our server every time so the count
      // increment runs.
      "Cache-Control": "private, no-store",
    },
  });
}

// Small helper so every error path has the same shape, and call sites
// read clearly: `errorResponse("Link wygasł.", 410)`.
function errorResponse(message: string, status: number): Response {
  return NextResponse.json({ error: message }, { status });
}
