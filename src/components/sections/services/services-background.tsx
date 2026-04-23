import type { Ref } from "react";
import type { SiteT } from "@/lib/get-site";
import { Image } from "@/components/ui/image";

type PropsT = {
  data: SiteT["services"];
  imageRef?: Ref<HTMLDivElement>;
};

/* Image layer shared by ServicesSticky (desktop) and ServicesParallax (mobile).
   180% tall wrapper so GSAP can translate it upward for parallax without
   leaving a gap. Own overflow-clip so the scaled image doesn't leak. */
export function ServicesBackground({ data, imageRef }: PropsT) {
  return (
    <>
      <div className="absolute inset-0 overflow-clip">
        <div ref={imageRef} className="absolute inset-x-0 top-0 h-[180%]">
          {data.background?.url && (
            <Image
              src={data.background.url}
              alt={data.backgroundAlt || data.background.alt}
              fill
              priority
              className="rounded-none object-cover"
              sizes="100vw"
            />
          )}
        </div>
      </div>
      <div className="absolute inset-0 bg-off-black/20" />
    </>
  );
}
