import { Image } from "@/components/ui/image";
import { EyebrowTag } from "@/components/home/eyebrow-tag";
import { FadeUp } from "@/components/home/fade-up";
import { SectionContent } from "@/components/home/section-content";
import { SECTION_IDS } from "@/components/home/section-ids";
// import aboutImg from "@/moodboard/marta_photos/secondary-reference-instagram-3.webp"; // with dogs
import aboutImg from "@/moodboard/marta_photos/secondary-reference-instagram-24.webp"; // mediterranean terrace
// import aboutImg2 from "@/moodboard/marta_photos/secondary-reference-instagram-28.webp"; // tropical, coral dress
// import aboutImg from "@/moodboard/marta_photos/secondary-reference-instagram-31.webp"; // bicycle, purple outfit
/* Marta photos — swap into aboutImg / aboutImg2 as needed:
 */

export function About() {
  return (
    <section
      id={SECTION_IDS.about}
      className="relative overflow-hidden py-24 md:py-32 lg:py-40"
    >
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
                className="aspect-4/5 w-full rounded-2xl object-cover"
                sizes="(max-width: 768px) 100vw, 40vw"
                // placeholder="blur"
              />
            </FadeUp>

            {/* Yellow Dot geometric accent — ebook-style */}
            <FadeUp
              className="absolute -left-4 top-8 z-0 h-24 w-24 rounded-full bg-yellow md:-left-8 md:h-32 md:w-32"
              amount={0.2}
              delay={0.5}
            />
          </div>

          {/* Text column — 6 of 12 cols, offset start */}
          <div className="flex flex-col justify-center md:col-span-6 md:col-start-7">
            <FadeUp
              as="h2"
              className="text-heading-lg text-off-black"
              delay={0.2}
            >
              Gotuję prosto,
              <br />
              <span className="text-coral">ale nigdy</span>
              <br />
              banalnie
            </FadeUp>

            <FadeUp className="mt-8 space-y-5" delay={0.4}>
              <p className="max-w-[55ch] text-body-lg text-muted">
                Tworzę jedzenie dopasowane do ludzi i sytuacji — od kameralnych
                kolacji, przez eventy, po wyjazdy w miejscach, które rzadko mają
                cokolwiek wspólnego z klasyczną kuchnią.
              </p>

              {/* Pull quote — editorial serif, breaks visual rhythm */}
              <blockquote className="border-l-4 border-coral py-2 pl-6">
                <p className="text-quote-lg text-off-black/90">
                  Łączę smak z funkcją — jedzenie ma nie tylko smakować, ale też
                  działać.
                </p>
              </blockquote>

              <p className="max-w-[55ch] text-body-lg text-muted">
                Pracuję na ekologicznych produktach, korzystam z fermentacji,
                świeżych ziół i składników wspierających organizm.
              </p>
              <p className="max-w-[55ch] text-body-lg text-muted">
                Moja droga do kuchni nie była oczywista — od banku, przez modę,
                po własną restaurację. Dziś pracuję jako nomadyczna kucharka,
                gotując w różnych miejscach świata.
              </p>
            </FadeUp>
          </div>
        </div>
      </SectionContent>
    </section>
  );
}
