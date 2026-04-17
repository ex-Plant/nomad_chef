"use client";

import { Image } from "@/components/ui/image";

import { FadeUp } from "@/components/shared/fade-up";
import { ScatterText } from "@/components/shared/scatter-text";
import { SECTION_IDS } from "@/config/section-ids";
import { CONTENT } from "@/config/content";
import { Section } from "@/components/shared/section";
import { SectionContent } from "@/components/shared/section-content";

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
import ig12 from "@/moodboard/gallery/secondary-reference-instagram-12.webp";
import ig17 from "@/moodboard/gallery/secondary-reference-instagram-17.webp";
import ig25 from "@/moodboard/gallery/secondary-reference-instagram-25.webp";
import ig33 from "@/moodboard/gallery/secondary-reference-instagram-33.webp";
import ig35 from "@/moodboard/gallery/secondary-reference-instagram-35.webp";
import ig36 from "@/moodboard/gallery/secondary-reference-instagram-36.webp";
import ig37 from "@/moodboard/gallery/secondary-reference-instagram-37.webp";
import ig38 from "@/moodboard/gallery/secondary-reference-instagram-38.webp";
import ig39 from "@/moodboard/gallery/secondary-reference-instagram-39.webp";

import { EyebrowTag } from "@/components/shared/eyebrow-tag";
import type { StaticImageData } from "next/image";

type GalleryItemT = {
  readonly src: StaticImageData;
  readonly alt: string;
};

const { alts } = CONTENT.gallery;

const GALLERY_IMAGES: readonly GalleryItemT[] = [
  { src: cs1, alt: alts.cs1 },
  { src: cs2, alt: alts.cs2 },
  { src: ig12, alt: alts.ig12 },
  { src: cs4, alt: alts.cs4 },
  { src: cs3, alt: alts.cs3 },
  { src: ig17, alt: alts.ig17 },
  // { src: ig32, alt: "Jedzenie z Instagrama" },
  { src: ig33, alt: alts.ig33 },
  { src: cs5, alt: alts.cs5 },
  // { src: ig34, alt: "Fotografia kulinarna" },
  { src: cs6, alt: alts.cs6 },
  { src: ig25, alt: alts.ig25 },
  { src: cs7, alt: alts.cs7 },
  { src: ig35, alt: alts.ig35 },
  { src: cs8, alt: alts.cs8 },
  { src: ig36, alt: alts.ig36 },
  { src: cs9, alt: alts.cs9 },
  // { src: ig22, alt: "Fotografia kulinarna" },
  { src: cs10, alt: alts.cs10 },
  { src: ig37, alt: alts.ig37 },
  // { src: cs11, alt: "Close-up plating" },
  { src: ig38, alt: alts.ig38 },
  { src: ig39, alt: alts.ig39 },
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
    <Section id={SECTION_IDS.gallery} className="bg-warm-white">
      <SectionContent>
        {/* Header — asymmetric */}
        <EyebrowTag color="coral" withLine>
          {CONTENT.gallery.eyebrow}
        </EyebrowTag>

        <div className="mb-16 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <ScatterText
            className="text-heading-lg"
            lines={[{ text: CONTENT.gallery.heading, className: "text-off-black" }]}
          />
        </div>

        {/* Staggered masonry — each column starts at a different height */}
        <GalleryGrid images={GALLERY_IMAGES} />

        {/* Bottom accent — flush with grid */}
        <FadeUp
          className="mt-16 flex items-center gap-6"
          amount={0.5}
          delay={0.2}
        >
          <div className="h-px flex-1 bg-coral" />
          <span className="text-label-sm text-coral">{CONTENT.gallery.handle}</span>
          <div className="h-px flex-1 bg-coral" />
        </FadeUp>
      </SectionContent>
    </Section>
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
                className="group"
                amount={0.1}
                delay={(globalIndex % 8) * 0.05}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  className=" transition-all duration-700 ease-brand group-hover:scale-105 group-hover:brightness-110"
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
