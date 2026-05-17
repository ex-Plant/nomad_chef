import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";

export const dynamic = "force-dynamic";

type BodyT = { orderNumber?: unknown };

export async function POST(req: Request): Promise<Response> {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = (await req.json().catch(() => ({}))) as BodyT;
  const orderNumber = typeof body.orderNumber === "string" ? body.orderNumber : null;
  if (!orderNumber) {
    return NextResponse.json({ error: "orderNumber required" }, { status: 400 });
  }

  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "orders",
    where: { orderNumber: { equals: orderNumber } },
    limit: 1,
    depth: 0,
  });
  const order = result.docs[0];
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  if (order.paymentStatus !== "pending") {
    return NextResponse.json(
      { error: `Order already in status: ${order.paymentStatus}` },
      { status: 400 },
    );
  }

  await payload.update({
    collection: "orders",
    id: order.id,
    data: {
      paymentStatus: "paid",
      paymentRef: `dummy-${new Date().toISOString()}`,
    },
  });

  return NextResponse.json({ ok: true, orderNumber });
}
