import Image from "next/image";
import { EyebrowTag } from "@/components/home/eyebrow-tag";
import { FadeUp } from "@/components/home/fade-up";
import aboutImg2 from "@/app/moodboard/marta_photos/secondary-reference-instagram-6.webp"; // hat, sunset from behind
// import aboutImg from "@/app/moodboard/marta_photos/secondary-reference-instagram-3.webp"; // with dogs
import aboutImg from "@/app/moodboard/marta_photos/secondary-reference-instagram-24.webp"; // mediterranean terrace
// import aboutImg2 from "@/app/moodboard/marta_photos/secondary-reference-instagram-28.webp"; // tropical, coral dress
// import aboutImg from "@/app/moodboard/marta_photos/secondary-reference-instagram-31.webp"; // bicycle, purple outfit
/* Marta photos — swap into aboutImg / aboutImg2 as needed:
 */

export function About() {
  return (
    <section
      id="o-mnie"
      className="relative overflow-hidden bg-warm-white py-24 md:py-32 lg:py-40"
    >
      <div className="px-6 md:px-12 lg:px-20">
        {/* Eyebrow */}
        <FadeUp className="mb-16">
          <EyebrowTag color="coral" withLine>O mnie</EyebrowTag>
        </FadeUp>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-8">
          {/* Images column — 5 of 12 cols, staggered */}
          <div className="relative md:col-span-5">
            <FadeUp className="relative z-10" amount={0.2} delay={0.1}>
              <Image
                src={aboutImg}
                alt="Szefowa kuchni trzymająca talerz"
                className="aspect-[4/5] w-full rounded-2xl object-cover"
                sizes="(max-width: 768px) 100vw, 40vw"
                placeholder="blur"
              />
            </FadeUp>

            {/* Overlapping secondary image — offset for DESIGN_VARIANCE:8 */}
            <FadeUp className="absolute -bottom-8 -right-4 z-20 w-2/5 md:-right-12" margin="200px 0px 0px 0px" delay={0.3}>
              <div className="overflow-hidden rounded-xl border-4 border-warm-white shadow-xl">
                <Image
                  src={aboutImg2}
                  alt="Plating na różowym tle"
                  className="aspect-square w-full object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                  placeholder="blur"
                  loading="eager"
                />
              </div>
            </FadeUp>

            {/* Blue geometric accent — ebook-style */}
            <FadeUp className="absolute -left-4 top-8 z-0 h-24 w-24 rounded-full bg-yellow md:-left-8 md:h-32 md:w-32" amount={0.2} delay={0.5} />
          </div>

          {/* Text column — 6 of 12 cols, offset start */}
          <div className="flex flex-col justify-center md:col-span-6 md:col-start-7">
            <FadeUp as="h2" className="font-[family-name:var(--font-archivo-black)] text-4xl uppercase leading-[0.9] tracking-tighter text-off-black md:text-6xl lg:text-7xl" delay={0.2}>
              Gotuję prosto,
              <br />
              <span className="text-coral">ale nigdy</span>
              <br />
              banalnie
            </FadeUp>

            <FadeUp className="mt-8 space-y-5" delay={0.4}>
              <p className="max-w-[55ch] font-[family-name:var(--font-instrument)] text-lg leading-relaxed text-off-black/70 md:text-xl">
                Tworzę jedzenie dopasowane do ludzi i sytuacji — od kameralnych
                kolacji, przez eventy, po wyjazdy w miejscach, które rzadko mają
                cokolwiek wspólnego z klasyczną kuchnią.
              </p>

              {/* Pull quote — editorial serif, breaks visual rhythm */}
              <blockquote className="border-l-4 border-coral py-2 pl-6">
                <p className="font-[family-name:var(--font-playfair)] text-xl italic leading-snug text-off-black/90 md:text-2xl">
                  Łączę smak z funkcją — jedzenie ma nie tylko smakować, ale też
                  działać.
                </p>
              </blockquote>

              <p className="max-w-[55ch] font-[family-name:var(--font-instrument)] text-lg leading-relaxed text-off-black/70 md:text-xl">
                Pracuję na ekologicznych produktach, korzystam z fermentacji,
                świeżych ziół i składników wspierających organizm.
              </p>
              <p className="max-w-[55ch] font-[family-name:var(--font-instrument)] text-lg leading-relaxed text-off-black/70 md:text-xl">
                Moja droga do kuchni nie była oczywista — od banku, przez modę,
                po własną restaurację. Dziś pracuję jako nomadyczna kucharka,
                gotując w różnych miejscach świata.
              </p>
            </FadeUp>
          </div>
        </div>
      </div>
    </section>
  );
}
