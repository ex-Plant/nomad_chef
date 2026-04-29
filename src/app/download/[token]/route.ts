import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@/payload.config";

type RouteContextT = { params: Promise<{ token: string }> };

export async function GET(_req: Request, ctx: RouteContextT): Promise<Response> {
  const { token } = await ctx.params;
  if (!token || token.length < 32) {
    return errorResponse("Nieprawidłowy link.", 400);
  }

  const payload = await getPayload({ config });

  const result = await payload.find({
    collection: "orders",
    where: { downloadToken: { equals: token } },
    limit: 1,
    depth: 1,
  });
  const order = result.docs[0];

  if (!order) return errorResponse("Link nieaktywny.", 404);
  if (order.paymentStatus !== "paid") return errorResponse("Zamówienie nieopłacone.", 403);

  const expiresAt = order.downloadExpiresAt ? new Date(order.downloadExpiresAt) : null;
  if (!expiresAt || expiresAt < new Date()) {
    return errorResponse("Link wygasł. Skontaktuj się z nami, aby otrzymać nowy.", 410);
  }

  const limit = order.downloadLimit ?? 5;
  const count = order.downloadCount ?? 0;
  if (count >= limit) {
    return errorResponse("Wykorzystano limit pobrań. Skontaktuj się z nami, aby otrzymać nowy link.", 429);
  }

  const product = typeof order.product === "object" ? order.product : null;
  if (!product || product.format !== "digital" || !product.file) {
    return errorResponse("Brak pliku do pobrania.", 500);
  }

  const file = typeof product.file === "object" ? product.file : null;
  if (!file?.url) return errorResponse("Plik niedostępny.", 500);

  const fileResponse = await fetch(file.url);
  if (!fileResponse.ok || !fileResponse.body) {
    return errorResponse("Nie można pobrać pliku.", 502);
  }

  await payload.update({
    collection: "orders",
    id: order.id,
    data: { downloadCount: count + 1 },
    context: { skipFulfillment: true },
  });

  const filename = file.filename ?? "ebook.pdf";
  return new Response(fileResponse.body, {
    status: 200,
    headers: {
      "Content-Type": file.mimeType ?? "application/octet-stream",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}

function errorResponse(message: string, status: number): Response {
  return NextResponse.json({ error: message }, { status });
}
