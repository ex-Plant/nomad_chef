"use client";

import { useRef } from "react";
import { m, type Variants } from "framer-motion";
import { Image } from "@/components/ui/image";
import { EyebrowTag } from "@/components/shared/eyebrow-tag";
import { FadeUp } from "@/components/shared/fade-up";
import { ScatterText } from "@/components/shared/scatter-text";
import { SectionContent } from "@/components/shared/section-content";
import { SECTION_IDS } from "@/config/section-ids";
import type { SiteT } from "@/lib/get-site";
import { Section } from "@/components/shared/section";

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 120, damping: 22, mass: 1 },
  },
};

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
            {/* <FadeUp
              className="absolute -left-16 -top-20 md:-top-36 md:-left-32 "
              amount={0.2}
              delay={0.5}
            >
              <Starburst color="blue" size="" />
            </FadeUp> */}
          </div>

          {/* Text column — 6 of 12 cols, offset start */}
          <div className="flex flex-col justify-center md:col-span-6 md:col-start-7">
            <ScatterText
              className="text-heading-lg"
              triggerRef={sectionRef}
              lines={data.headingLines}
            />

            <m.div
              className="mt-8 space-y-5"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <m.p
                variants={itemVariants}
                className="max-w-[55ch] text-sans text-muted whitespace-pre-line"
              >
                {data.intro}
              </m.p>

              <m.blockquote
                variants={itemVariants}
                className="border-l-4 border-coral py-2 pl-6"
              >
                <p className="text-xl md:text-2xl font-quote italic leading-snug text-off-black/90 max-w-[35ch] whitespace-pre-line">
                  {data.quote}
                </p>
              </m.blockquote>

              {data.paragraphs.map((p) => (
                <m.p
                  key={p}
                  variants={itemVariants}
                  className="max-w-[55ch] text-sans text-muted whitespace-pre-line"
                >
                  {p}
                </m.p>
              ))}
            </m.div>
          </div>
        </div>
      </SectionContent>
    </Section>
  );
}
