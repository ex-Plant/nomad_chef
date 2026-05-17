import type { SiteT } from "@/types/site";

type SlideT = SiteT["services"]["slides"][number];

/* Slide text block shared by ServicesSticky and ServicesParallax — the
   coral title box, yellow tagline box, pink description box. */
export function ServicesSlideText({ slide }: { slide: SlideT }) {
  return (
    <>
      <h3 className="max-w-sm sm:max-w-xl lg:max-w-2xl">
        <span className="bg-coral text-heading-lg max-w-[12ch] box-decoration-clone pr-2 leading-[0.9] tracking-tight text-white">
          {slide.title}
        </span>
      </h3>
      {slide.tagline && (
        <p className="mt-8 mb-2 max-w-sm leading-tight sm:max-w-md">
          <span className="bg-yellow text-off-black box-decoration-clone px-1 pr-2 font-sans text-sm leading-[0.9] whitespace-pre-line md:text-base">
            {slide.tagline}
          </span>
        </p>
      )}
      {slide.description && (
        <p className="max-w-sm leading-tight lg:max-w-md">
          <span className="bg-pink text-off-black box-decoration-clone px-1 pr-2 font-sans text-sm leading-[0.8] whitespace-pre-line md:text-base">
            {slide.description}
          </span>
        </p>
      )}
    </>
  );
}
