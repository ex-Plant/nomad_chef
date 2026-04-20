"use client";

import { useRef } from "react";
import { Image } from "@/components/ui/image";
import { EyebrowTag } from "@/components/shared/eyebrow-tag";
import { FadeUp } from "@/components/shared/fade-up";
import { ScatterText } from "@/components/shared/scatter-text";
import { Starburst } from "@/components/shared/starburst";
import { SectionContent } from "@/components/shared/section-content";
import { SECTION_IDS } from "@/config/section-ids";
import type { SiteT } from "@/lib/get-site";
import { Section } from "@/components/shared/section";

type AboutPropsT = { data: SiteT["about"] };

export function About({ data }: AboutPropsT) {
  const sectionRef = useRef<HTMLDivElement>(null);

  return (
    <Section ref={sectionRef} id={SECTION_IDS.about} className="bg-warm-white">
      <SectionContent>
        <EyebrowTag color="coral" className={`z-1 relative`} withLine>
          {data.eyebrow}
        </EyebrowTag>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-8">
          {/* Images column — 5 of 12 cols, staggered */}
          <div className="relative  md:col-span-5">
            {data.image && (
              <FadeUp className="relative z-1" amount={0.2} delay={0.1}>
                <Image
                  src={data.image.url}
                  alt={data.imageAlt || data.image.alt}
                  width={data.image.width ?? 1200}
                  height={data.image.height ?? 1500}
                  className="aspect-4/5 "
                  sizes="(max-width: 768px) 100vw, 40vw"
                />
              </FadeUp>
            )}

            {/* Yellow starburst accent — behind image */}
            <FadeUp
              className="absolute -left-16 -top-20 md:-top-36 md:-left-32 "
              amount={0.2}
              delay={0.5}
            >
              <Starburst color="yellow" size="lg" />
            </FadeUp>
          </div>

          {/* Text column — 6 of 12 cols, offset start */}
          <div className="flex flex-col justify-center md:col-span-6 md:col-start-7">
            <ScatterText
              className="text-heading-lg"
              triggerRef={sectionRef}
              lines={data.headingLines}
            />

            <FadeUp className="mt-8 space-y-5" delay={0.4}>
              <p className="max-w-[55ch] text-sans text-muted whitespace-pre-line">
                {data.intro}
              </p>

              {/* Pull quote — editorial serif, breaks visual rhythm */}
              <blockquote className="border-l-4 border-coral py-2 pl-6">
                <p className="text-xl md:text-2xl font-quote italic leading-snug text-off-black/90 max-w-[35ch] whitespace-pre-line">
                  {data.quote}
                </p>
              </blockquote>

              {data.paragraphs.map((p) => (
                <p
                  key={p}
                  className="max-w-[55ch] text-sans text-muted whitespace-pre-line"
                >
                  {p}
                </p>
              ))}
            </FadeUp>
          </div>
        </div>
      </SectionContent>
    </Section>
  );
}
