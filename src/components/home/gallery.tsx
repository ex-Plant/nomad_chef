"use client";

import { Image } from "@/components/ui/image";

import { FadeUp } from "@/components/home/fade-up";
import { SECTION_IDS } from "@/components/home/section-ids";
import { SectionContent } from "@/components/home/section-content";

import cs1 from "@/moodboard/gallery/client-selected-1.webp";
import cs2 from "@/moodboard/gallery/client-selected-2.webp";
import cs3 from "@/moodboard/gallery/client-selected-3.webp";
import cs4 from "@/moodboard/gallery/client-selected-4.webp";
import cs5 from "@/moodboard/gallery/client-selected-5.webp";
import cs6 from "@/moodboard/gallery/client-selected-6.webp";
import cs7 from "@/moodboard/gallery/client-selected-7.webp";
import cs8 from "@/moodboard/gallery/client-selected-8.webp";
import cs9 from "@/moodboard/gallery/client-selected-9.webp";
import cs10 from "@/moodboard/gallery/client-selected-10.webp";
import cs11 from "@/moodboard/gallery/client-selected-11.webp";
import ig4 from "@/moodboard/gallery/secondary-reference-instagram-4.webp";
import ig5 from "@/moodboard/gallery/secondary-reference-instagram-5.webp";
import ig12 from "@/moodboard/gallery/secondary-reference-instagram-12.webp";
import ig17 from "@/moodboard/gallery/secondary-reference-instagram-17.webp";
import ig22 from "@/moodboard/gallery/secondary-reference-instagram-22.webp";
import ig25 from "@/moodboard/gallery/secondary-reference-instagram-25.webp";
import ig32 from "@/moodboard/gallery/secondary-reference-instagram-32.webp";
import ig33 from "@/moodboard/gallery/secondary-reference-instagram-33.webp";
import ig34 from "@/moodboard/gallery/secondary-reference-instagram-34.webp";
import ig35 from "@/moodboard/gallery/secondary-reference-instagram-35.webp";
import ig36 from "@/moodboard/gallery/secondary-reference-instagram-36.webp";
import ig37 from "@/moodboard/gallery/secondary-reference-instagram-37.webp";
import ig38 from "@/moodboard/gallery/secondary-reference-instagram-38.webp";
import ig39 from "@/moodboard/gallery/secondary-reference-instagram-39.webp";

import { EyebrowTag } from "@/components/home/eyebrow-tag";
import type { StaticImageData } from "next/image";

type GalleryItemT = {
  readonly src: StaticImageData;
  readonly alt: string;
};

const GALLERY_IMAGES: readonly GalleryItemT[] = [
  { src: cs1, alt: "Ryż z pistacjami i mango" },
  { src: cs2, alt: "Zioła w słoiku" },
  { src: ig12, alt: "Fotografia kulinarna" },
  { src: cs4, alt: "Stół pełny dań" },
  { src: cs3, alt: "Złoty drink" },
  { src: ig17, alt: "Fotografia kulinarna" },
  // { src: ig32, alt: "Jedzenie z Instagrama" },
  { src: ig33, alt: "Jedzenie z Instagrama" },
  { src: cs5, alt: "Szefowa kuchni z talerzem" },
  // { src: ig34, alt: "Fotografia kulinarna" },
  { src: cs6, alt: "Ryż z pistacjami" },
  { src: ig25, alt: "Jedzenie z Instagrama" },
  { src: cs7, alt: "Uczta — widok z góry" },
  { src: ig35, alt: "Fotografia kulinarna" },
  { src: cs8, alt: "Jajko na niebieskim tle" },
  { src: ig36, alt: "Jedzenie z Instagrama" },
  { src: cs9, alt: "Danie na pomarańczowym tle" },
  // { src: ig22, alt: "Fotografia kulinarna" },
  { src: cs10, alt: "Plating na różowym talerzu" },
  { src: ig37, alt: "Jedzenie z Instagrama" },
  // { src: cs11, alt: "Close-up plating" },
  { src: ig38, alt: "Kolorowy talerz" },
  { src: ig4, alt: "Fotografia kulinarna" },
  { src: ig39, alt: "Jedzenie z Instagrama" },
] as const;

/* Staggered masonry: images distributed round-robin into columns,
   each column starts at a different vertical offset for organic rhythm.
   Fully CMS-safe — works with any number of images from backend. */

const COLUMN_OFFSETS = ["mt-0", "mt-16", "mt-4", "mt-12"] as const;

function distributeIntoColumns<TItem>(
  items: readonly TItem[],
  numCols: number
): TItem[][] {
  const columns: TItem[][] = Array.from({ length: numCols }, () => []);
  items.forEach((item, i) => columns[i % numCols].push(item));
  return columns;
}

export function Gallery() {
  return (
    <section
      id={SECTION_IDS.gallery}
      className="relative overflow-hidden bg-warm-white py-24 md:py-32 lg:py-40"
    >
      <SectionContent>
        {/* Header — asymmetric */}
        <EyebrowTag color="coral" withLine>
          Galeria
        </EyebrowTag>

        <FadeUp
          className="mb-16 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
          delay={0.1}
        >
          <h2 className="text-heading text-5xl text-off-black md:text-7xl lg:text-8xl">
            Galeria
          </h2>
        </FadeUp>

        {/* Staggered masonry — each column starts at a different height */}
        <GalleryGrid images={GALLERY_IMAGES} />

        {/* Bottom accent — flush with grid */}
        <FadeUp
          className="mt-16 flex items-center gap-6"
          amount={0.5}
          delay={0.2}
        >
          <div className="h-px flex-1 bg-coral" />
          <span className="text-label text-xs tracking-link text-coral">
            @marta_leśniewska
          </span>
          <div className="h-px flex-1 bg-coral" />
        </FadeUp>
      </SectionContent>
    </section>
  );
}

/* ── Subcomponent ───────────────────────────────────── */

function MasonryColumns({
  images,
  numCols,
  offsets,
}: {
  readonly images: readonly GalleryItemT[];
  readonly numCols: number;
  readonly offsets: readonly string[];
}) {
  const cols = distributeIntoColumns(images, numCols);

  return (
    <div
      className="grid gap-3 md:gap-4"
      style={{ gridTemplateColumns: `repeat(${numCols}, minmax(0, 1fr))` }}
    >
      {cols.map((column, colIndex) => (
        <div
          key={colIndex}
          className={`flex flex-col gap-3 md:gap-4 ${
            offsets[colIndex] ?? "mt-0"
          }`}
        >
          {column.map((image, imgIndex) => {
            const globalIndex = imgIndex * numCols + colIndex;
            return (
              <FadeUp
                key={`${image.alt}-${globalIndex}`}
                className="group overflow-hidden rounded-lg"
                amount={0.1}
                delay={(globalIndex % 8) * 0.05}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  className="w-full object-cover transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105 group-hover:brightness-110"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  placeholder="blur"
                />
              </FadeUp>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function GalleryGrid({ images }: { readonly images: readonly GalleryItemT[] }) {
  return (
    <>
      {/* Mobile: 2 columns */}
      <div className="md:hidden">
        <MasonryColumns
          images={images}
          numCols={2}
          offsets={["mt-0", "mt-10"]}
        />
      </div>
      {/* Tablet: 3 columns */}
      <div className="hidden md:block lg:hidden">
        <MasonryColumns
          images={images}
          numCols={3}
          offsets={["mt-0", "mt-16", "mt-4"]}
        />
      </div>
      {/* Desktop: 4 columns */}
      <div className="hidden lg:block">
        <MasonryColumns images={images} numCols={4} offsets={COLUMN_OFFSETS} />
      </div>
    </>
  );
}
