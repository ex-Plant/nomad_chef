import { redirect } from "next/navigation";
import { getPayload } from "payload";
import config from "@payload-config";
import { readCheckoutCookie } from "@/lib/checkout-session";
import { P24_PAYABLE_WINDOW_MS } from "@/config/payments";
import { ProcessingStatus } from "./processing-status";

export const dynamic = "force-dynamic";

export default async function CheckoutProcessingPage() {
  const session = await readCheckoutCookie();
  if (!session) redirect("/");

  const payload = await getPayload({ config });
  const order = await payload
    .findByID({ collection: "orders", id: session.orderId, depth: 1 })
    .catch(() => null);
  if (!order) redirect("/");

  if (order.paymentStatus === "paid" && order.downloadToken) {
    redirect(`/download/${order.downloadToken}`);
  }

  const customer = typeof order.customer === "object" ? order.customer : null;

  return (
    <main className="bg-coral relative flex min-h-svh flex-col items-center justify-center px-6 py-24 text-white">
      <ProcessingStatus
        orderNumber={order.orderNumber}
        customerEmail={customer?.email ?? null}
        paymentStatus={order.paymentStatus}
        payableWindowMs={P24_PAYABLE_WINDOW_MS}
      />
    </main>
  );
}
