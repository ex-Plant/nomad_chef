import type { Ref } from "react";
import type { SiteT } from "@/lib/get-site";
import { Image } from "@/components/ui/image";

type PropsT = {
  data: SiteT["services"];
  imageRef?: Ref<HTMLDivElement>;
};

/* Image layer shared by ServicesSticky (desktop) and ServicesParallax (mobile).
   Inner wrapper is 140% tall so GSAP can translate it upward (-28%) for
   parallax without exposing the bottom edge. `sizes` is tuned to the real
   rendered size so Next/Image ships a source big enough to render crisply
   without upscaling. */
export function ServicesBackground({ data, imageRef }: PropsT) {
  return (
    <>
      <div className="absolute inset-0 overflow-clip">
        <div ref={imageRef} className="absolute inset-x-0 top-0 h-[140%]">
          {data.background?.url && (
            <Image
              src={data.background.url}
              alt={data.backgroundAlt || data.background.alt}
              fill
              priority
              className="rounded-none object-cover"
              sizes="140vh"
            />
          )}
        </div>
      </div>
      <div className="absolute inset-0 bg-off-black/20" />
    </>
  );
}
