import { SECTION_IDS } from "@/config/section-ids";
import type { SiteT } from "@/lib/get-site";
import { Image } from "@/components/ui/image";
import { SectionContent } from "@/components/shared/section-content";
import { EyebrowTag } from "@/components/shared/eyebrow-tag";
import { ServicesSlideText } from "./services-slide-text";

type PropsT = { data: SiteT["services"] };

/* Services static — reducedMotion variant.
   One shared background image spans the whole section (rendered once, not
   duplicated per slide). Slide panels stack on top with small gaps so each
   reads as its own card. Used regardless of device when reducedMotion is on
   (iOS Low Power Mode detection or manual toggle). */
export function ServicesStatic({ data }: PropsT) {
  const bg = data.background;

  return (
    <div id={SECTION_IDS.services} className="relative z-1 bg-off-black">
      {/* Shared background — one image, rendered once for the whole section */}
      {bg?.url && (
        <div className="absolute inset-0 z-0 overflow-hidden">
          <Image
            src={bg.url}
            alt={data.backgroundAlt || bg.alt}
            fill
            priority
            className="rounded-none object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-off-black/20" />
        </div>
      )}

      {/* Slide stack — small gaps separate panels */}
      <div className="relative z-10 flex flex-col gap-2">
        <div className="pt-12 md:pt-24">
          <SectionContent>
            <EyebrowTag color="yellow" withLine lineColor="yellow">
              {data.eyebrow}
            </EyebrowTag>
          </SectionContent>
        </div>
        {data.slides.map((slide) => (
          <div key={slide.title} className="relative w-full py-24 last:pb-56">
            <SectionContent>
              <ServicesSlideText slide={slide} />
            </SectionContent>
          </div>
        ))}
      </div>
    </div>
  );
}
