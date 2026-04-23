import type { SiteT } from "@/lib/get-site";

type SlideT = SiteT["services"]["slides"][number];

/* Slide text block shared by ServicesSticky and ServicesParallax — the
   coral title box, yellow tagline box, pink description box. */
export function ServicesSlideText({ slide }: { slide: SlideT }) {
  return (
    <>
      <h3 className="max-w-sm sm:max-w-xl lg:max-w-2xl">
        <span className="bg-coral text-white box-decoration-clone leading-[0.9] pr-2 max-w-[12ch] text-heading-lg tracking-tight">
          {slide.title}
        </span>
      </h3>
      {slide.tagline && (
        <p className="mt-8 max-w-sm sm:max-w-md leading-tight mb-2">
          <span className="bg-yellow text-off-black box-decoration-clone leading-[0.9] px-1 pr-2 font-sans text-sm md:text-base whitespace-pre-line">
            {slide.tagline}
          </span>
        </p>
      )}
      {slide.description && (
        <p className="max-w-sm lg:max-w-md leading-tight">
          <span className="bg-pink text-off-black box-decoration-clone leading-[0.8] px-1 pr-2 font-sans text-sm md:text-base whitespace-pre-line">
            {slide.description}
          </span>
        </p>
      )}
    </>
  );
}
