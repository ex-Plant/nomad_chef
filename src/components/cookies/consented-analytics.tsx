"use client";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { useConsentManager } from "@c15t/nextjs";
import { MetaPixel } from "@/components/analytics/meta-pixel";

// All three trackers fall under "measurement" consent — nothing loads until
// the visitor opts in via the banner or preferences dialog.
export function ConsentedAnalytics() {
  const { has } = useConsentManager();
  if (!has("measurement")) return null;

  return (
    <>
      <MetaPixel />
      <Analytics />
      <SpeedInsights />
    </>
  );
}
