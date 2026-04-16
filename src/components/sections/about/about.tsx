"use client";

import { useRef } from "react";
import { Image } from "@/components/ui/image";
import { EyebrowTag } from "@/components/shared/eyebrow-tag";
import { FadeUp } from "@/components/shared/fade-up";
import { ScatterText } from "@/components/shared/scatter-text";
import { Starburst } from "@/components/shared/starburst";
import { SectionContent } from "@/components/shared/section-content";
import { SECTION_IDS } from "@/config/section-ids";
import { Section } from "@/components/shared/section";
// import aboutImg from "@/moodboard/marta_photos/secondary-reference-instagram-3.webp"; // with dogs
import aboutImg from "@/moodboard/marta_photos/secondary-reference-instagram-24.webp"; // mediterranean terrace
// import aboutImg2 from "@/moodboard/marta_photos/secondary-reference-instagram-28.webp"; // tropical, coral dress
// import aboutImg from "@/moodboard/marta_photos/secondary-reference-instagram-31.webp"; // bicycle, purple outfit
/* Marta photos — swap into aboutImg / aboutImg2 as needed:
 */

const HEADING_LINES = [
  { text: "Gotuję", className: "text-off-black" },
  { text: "prosto,", className: "text-off-black" },
  { text: "ale nigdy", className: "text-coral" },
  { text: "banalnie", className: "text-off-black" },
] as const;

export function About() {
  const sectionRef = useRef<HTMLDivElement>(null);

  return (
    <Section ref={sectionRef} id={SECTION_IDS.about}>
      <SectionContent>
        <EyebrowTag color="coral" withLine>
          O mnie
        </EyebrowTag>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-8">
          {/* Images column — 5 of 12 cols, staggered */}
          <div className="relative md:col-span-5">
            <FadeUp className="relative z-10" amount={0.2} delay={0.1}>
              <Image
                src={aboutImg}
                alt="Szefowa kuchni trzymająca talerz"
                className="aspect-4/5"
                sizes="(max-width: 768px) 100vw, 40vw"
                // placeholder="blur"
              />
            </FadeUp>

            {/* Yellow starburst accent — behind image */}
            <FadeUp
              className="absolute -left-8 -top-12 md:-top-24 z-[-2] md:-left-24 "
              amount={0.2}
              delay={0.5}
            >
              <Starburst color="yellow" size="md" />
            </FadeUp>
          </div>

          {/* Text column — 6 of 12 cols, offset start */}
          <div className="flex flex-col justify-center md:col-span-6 md:col-start-7">
            <ScatterText
              className="text-heading-lg"
              triggerRef={sectionRef}
              lines={HEADING_LINES}
            />

            <FadeUp className="mt-8 space-y-5" delay={0.4}>
              <p className="max-w-[55ch] text-sans text-muted">
                Tworzę jedzenie dopasowane do ludzi i sytuacji — od kameralnych
                kolacji, przez eventy, po wyjazdy w miejscach, które rzadko mają
                cokolwiek wspólnego z klasyczną kuchnią.
              </p>

              {/* Pull quote — editorial serif, breaks visual rhythm */}
              <blockquote className="border-l-4 border-coral py-2 pl-6">
                <p className="text-quote-lg text-off-black/90 max-w-[35ch]">
                  Łączę smak z funkcją — jedzenie ma nie tylko smakować, ale też
                  działać.
                </p>
              </blockquote>

              <p className="max-w-[55ch] text-sans text-muted">
                Pracuję na ekologicznych produktach, korzystam z fermentacji,
                świeżych ziół i składników wspierających organizm.
              </p>
              <p className="max-w-[55ch] text-sans text-muted">
                Moja droga do kuchni nie była oczywista — od banku, przez modę,
                po własną restaurację. Dziś pracuję jako nomadyczna kucharka,
                gotując w różnych miejscach świata.
              </p>
            </FadeUp>
          </div>
        </div>
      </SectionContent>
    </Section>
  );
}
