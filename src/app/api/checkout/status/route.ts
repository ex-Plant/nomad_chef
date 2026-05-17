import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { readCheckoutCookie } from "@/lib/checkout-session";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const session = await readCheckoutCookie();
  if (!session) {
    return NextResponse.json({ error: "Brak sesji koszyka." }, { status: 401 });
  }

  const payload = await getPayload({ config });
  const order = await payload
    .findByID({ collection: "orders", id: session.orderId, depth: 0 })
    .catch(() => null);
  if (!order) {
    return NextResponse.json({ error: "Zamówienie nie znalezione." }, { status: 404 });
  }

  return NextResponse.json({
    orderNumber: order.orderNumber,
    paymentStatus: order.paymentStatus,
    downloadToken: order.downloadToken ?? null,
  });
}
