import { getPayload } from "payload";
import config from "@payload-config";
import {
  findOrderByDownloadToken,
  resolveDownloadState,
} from "@/lib/orders/download-token";
import { Logo } from "@/components/shared/logo";
import { DownloadCard } from "./download-card";

export const dynamic = "force-dynamic";

type PagePropsT = { params: Promise<{ token: string }> };

export default async function DownloadPage({ params }: PagePropsT) {
  const { token } = await params;
  const payload = await getPayload({ config });
  const found = await findOrderByDownloadToken(payload, token, 1);
  const state = resolveDownloadState(found?.order ?? null);

  return (
    <main className="bg-warm-white text-off-black relative flex min-h-svh flex-col items-center justify-center px-6 py-24">
      <div className="flex w-full max-w-xl flex-col items-center gap-6">
        <Logo
          className="size-40 md:size-56"
          sizes="(min-width: 768px) 224px, 160px"
        />
        <DownloadCard
          token={token}
          status={state.status}
          expiresAt={state.expiresAt?.toISOString() ?? null}
          orderNumber={found?.order.orderNumber ?? null}
          customerEmail={found?.customer?.email ?? null}
        />
      </div>
    </main>
  );
}
