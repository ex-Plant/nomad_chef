"use client";

import { useSyncExternalStore } from "react";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { useConsentManager } from "@c15t/nextjs";
import { MetaPixel } from "@/components/analytics/meta-pixel";

const noopSubscribe = () => () => {};

// All three trackers fall under "measurement" consent — nothing loads until
// the visitor opts in via the banner or preferences dialog.
export function ConsentedAnalytics() {
  const { has } = useConsentManager();
  // c15t resolves consent from client-side storage in offline mode, so the
  // server can't know it. Stay null until hydrated (server snapshot false,
  // client snapshot true) to keep the server and first client paint identical —
  // otherwise consent-gated trackers hydrate mismatched (React #418).
  const hydrated = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  if (!hydrated || !has("measurement")) return null;

  return (
    <>
      <MetaPixel />
      <Analytics />
      <SpeedInsights />
    </>
  );
}
