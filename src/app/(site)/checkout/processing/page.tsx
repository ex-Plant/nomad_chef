import { redirect } from "next/navigation";
import { getPayload } from "payload";
import config from "@payload-config";
import { readCheckoutCookie } from "@/lib/checkout/checkout-session";
import { P24_PAYABLE_WINDOW_MS } from "@/config/payments";
import { asPopulated } from "@/lib/payload/as-populated";
import { ensureDownloadToken } from "@/lib/orders/fulfill-digital-order";
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

  // [P24-TRACE] temporary: what the server component sees on every page render /
  // router.refresh() tick — the source of the "are we still pending?" decision.
  console.log(
    `[P24-TRACE] processing page render orderNumber=${order.orderNumber} ` +
      `status=${order.paymentStatus} hasToken=${Boolean(order.downloadToken)}`,
  );

  const product = asPopulated(order.product);
  // Digital paid → ensure a token exists (heals the paid-but-no-token race
  // inline, never via cron) and redirect to the download. The store sells no
  // physical products, so the digital guard is a safety net: a non-digital paid
  // order falls through to the paid screen below and mints no token.
  if (order.paymentStatus === "paid" && product?.format === "digital") {
    const token = await ensureDownloadToken({ payload, order });
    console.log(
      `[P24-TRACE] processing page orderNumber=${order.orderNumber} → redirect /download`,
    );
    redirect(`/download/${token}`);
  }

  const customer = asPopulated(order.customer);

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
