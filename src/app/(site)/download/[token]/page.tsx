import { getPayload } from "payload";
import config from "@payload-config";
import {
  findOrderByDownloadToken,
  resolveDownloadState,
} from "@/lib/orders/download-token";
import { DownloadCard } from "./download-card";

export const dynamic = "force-dynamic";

type PagePropsT = { params: Promise<{ token: string }> };

export default async function DownloadPage({ params }: PagePropsT) {
  const { token } = await params;
  const payload = await getPayload({ config });
  const order = await findOrderByDownloadToken(payload, token, 1);
  const state = resolveDownloadState(order);

  const product =
    order && typeof order.product === "object" ? order.product : null;
  const customer =
    order && typeof order.customer === "object" ? order.customer : null;

  return (
    <main className="bg-warm-white text-off-black min-h-screen px-6 py-24">
      <div className="mx-auto max-w-xl">
        <DownloadCard
          token={token}
          status={state.status}
          expiresAt={state.expiresAt?.toISOString() ?? null}
          productTitle={product?.title ?? null}
          orderNumber={order?.orderNumber ?? null}
          customerEmail={customer?.email ?? null}
        />
      </div>
    </main>
  );
}
