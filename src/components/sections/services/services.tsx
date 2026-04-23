"use client";

import type { SiteT } from "@/lib/get-site";
import { useMediaQuery, BREAKPOINTS } from "@/hooks/use-media-query";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { ServicesSticky } from "./services-sticky";
import { ServicesParallax } from "./services-parallax";
import { ServicesStatic } from "./services-static";

type PropsT = { data: SiteT["services"] };

/* Services wrapper — picks the implementation at runtime.
   Desktop (>= md): CSS-sticky version (services-sticky.tsx).
   Mobile  (< md):  JS fake-pin version (services-parallax.tsx), needed to
   work around the iOS Safari 26 `position: sticky` regression.
   SSR renders the mobile variant (initializeWithValue: false → matches
   defaultValue on both server and first client render, so no hydration
   mismatch); desktop swaps after the first effect pass. */
export function Services({ data }: PropsT) {
  const isDesktop = useMediaQuery(BREAKPOINTS.md, {
    initializeWithValue: false,
  });
  const reducedMotion = useReducedMotion();
  if (reducedMotion) return <ServicesStatic data={data} />;
  return isDesktop ? (
    <ServicesSticky data={data} />
  ) : (
    <ServicesParallax data={data} />
  );
}
