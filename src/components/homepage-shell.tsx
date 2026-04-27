"use client";

import { Nav } from "@/components/sections/nav/nav";
import { Hero } from "@/components/sections/hero/hero";
import { About } from "@/components/sections/about/about";
import { Services } from "@/components/sections/services/services";
import { CampFoodSwiper } from "@/components/sections/camp-food/camp-food-swiper";
import { Gallery } from "@/components/sections/gallery/gallery";
import { Contact } from "@/components/sections/contact/contact";
import { GrainOverlay } from "@/components/ui/grain-overlay";
import type { SiteT } from "@/lib/get-site";
import { useVideoReady } from "../hooks/use-video-ready";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useScrollLock } from "@/hooks/use-scroll-lock";
import { AnimationHint } from "@/components/ui/animation-hint";

type HomepageShellPropsT = {
  site: SiteT;
};

export function HomepageShell({ site }: HomepageShellPropsT) {
  const reducedMotion = useReducedMotion();
  // Skip the play() attempt when the user has opted out — no reason to
  // round-trip through NotAllowedError if we're not going to animate.
  const { videoRef, isReady } = useVideoReady({
    enabled: !reducedMotion,
    timeoutMs: 5000,
  });

  // Lock the page while the hero video is still loading; release once ready.
  useScrollLock(!isReady);

  return (
    <>
      <Nav items={site.nav} />
      <main className="relative bg-warm-white">
        <GrainOverlay position="absolute" zIndex="z-50" />
        <Hero data={site.hero} videoRef={videoRef} isReady={isReady} />
        <div className={isReady ? `opacity-100` : `opacity-0`}>
          <About data={site.about} />
          <Services data={site.services} />
          <CampFoodSwiper data={site.campFood} />
          <Gallery data={site.gallery} />
          <Contact data={site.contact} />
        </div>
      </main>
      {isReady && <AnimationHint />}
    </>
  );
}
