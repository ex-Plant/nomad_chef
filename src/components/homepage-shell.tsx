"use client";

import { Nav } from "@/components/sections/nav/nav";
import { Hero } from "@/components/sections/hero/hero";
import { About } from "@/components/sections/about/about";
import { Services } from "@/components/sections/services/services";
import { CampFoodSwiper } from "@/components/sections/camp-food/camp-food-swiper";
import { Gallery } from "@/components/sections/gallery/gallery";
import { Contact } from "@/components/sections/contact/contact";
import { GrainOverlay } from "@/components/ui/grain-overlay";
import type { SiteT } from "@/types/site";
import type { Product } from "@/payload-types";
import { useVideoReady } from "../hooks/use-video-ready";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { AnimationHint } from "@/components/ui/animation-hint";

type HomepageShellPropsT = {
  site: SiteT;
  digitalProduct: Product | null;
};

export function HomepageShell({ site, digitalProduct }: HomepageShellPropsT) {
  const reducedMotion = useReducedMotion();
  // Skip the play() attempt when the user has opted out — no reason to
  // round-trip through NotAllowedError if we're not going to animate.
  const { videoRef, isReady } = useVideoReady({
    enabled: !reducedMotion,
    timeoutMs: 5000,
  });

  // Lock the page while the hero video is still loading; release once ready.

  return (
    <>
      <Nav items={site.nav} />
      <main className="bg-warm-white relative">
        <GrainOverlay position="fixed" zIndex="z-[600]" />
        <Hero data={site.hero} videoRef={videoRef} isReady={isReady} />
        <div className={isReady ? `opacity-100` : `opacity-0`}>
          <About data={site.about} />
          <Services data={site.services} />
          <CampFoodSwiper
            data={site.campFood}
            digitalProduct={digitalProduct}
            legal={site.contact.legal}
            legalLinks={site.legalLinks}
          />
          <Gallery data={site.gallery} />
          <Contact data={site.contact} legalLinks={site.legalLinks} />
        </div>
      </main>
      {isReady && <AnimationHint />}
    </>
  );
}
