"use client";

import { useState } from "react";

import { Image } from "@/components/ui/image";
import { GalleryLightbox } from "@/components/ui/gallery-lightbox";

import { FadeUp } from "@/components/shared/fade-up";
import { ScatterText } from "@/components/shared/scatter-text";
import { SECTION_IDS } from "@/config/section-ids";
import type { MediaT, SiteT } from "@/lib/get-site";
import { Section } from "@/components/shared/section";
import { SectionContent } from "@/components/shared/section-content";

import { EyebrowTag } from "@/components/shared/eyebrow-tag";

/* Staggered masonry: images distributed round-robin into columns,
   each column starts at a different vertical offset for organic rhythm.
   Fully CMS-safe — works with any number of images from backend. */

const COLUMN_OFFSETS = ["mt-0", "mt-16", "mt-4", "mt-12"] as const;

function distributeIntoColumns<TItem>(
  items: TItem[],
  numCols: number
): TItem[][] {
  const columns: TItem[][] = Array.from({ length: numCols }, () => []);
  items.forEach((item, i) => columns[i % numCols].push(item));
  return columns;
}

type GalleryPropsT = { data: SiteT["gallery"] };

export function Gallery({ data }: GalleryPropsT) {
  const [openIndex, setOpenIndex] = useState<number | undefined>(undefined);

  return (
    <Section id={SECTION_IDS.gallery} className="bg-warm-white">
      <SectionContent>
        {/* Header — asymmetric */}
        <EyebrowTag color="coral" withLine>
          {data.eyebrow}
        </EyebrowTag>

        <div className="mb-16 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <ScatterText
            className="text-heading-lg"
            lines={[{ text: data.heading, className: "text-off-black" }]}
          />
        </div>

        {/* Staggered masonry — each column starts at a different height */}
        <GalleryGrid
          images={data.images}
          onImageClick={(index) => setOpenIndex(index)}
        />

        <GalleryLightbox
          images={data.images.map((img) => ({ src: img.url, alt: img.alt }))}
          openIndex={openIndex}
          onClose={() => setOpenIndex(undefined)}
        />

        {/* Bottom accent — flush with grid */}
        <FadeUp
          className="mt-16 flex items-center gap-6"
          amount={0.5}
          delay={0.2}
        >
          <div className="h-px flex-1 bg-coral" />
          <span className="text-label-sm text-coral">{data.handle}</span>
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
  onImageClick,
}: {
  images: MediaT[];
  numCols: number;
  offsets: string[];
  onImageClick: (index: number) => void;
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
                key={`${image.url}-${globalIndex}`}
                className="group"
                amount={0.1}
                delay={(globalIndex % 8) * 0.05}
              >
                <button
                  type="button"
                  onClick={() => onImageClick(globalIndex)}
                  className="block w-full cursor-zoom-in overflow-hidden rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-coral"
                  aria-label={`Otwórz zdjęcie: ${image.alt}`}
                >
                  <Image
                    src={image.url}
                    alt={image.alt}
                    width={image.width ?? 1200}
                    height={image.height ?? 1200}
                    className=" transition-all duration-700 ease-brand group-hover:scale-105 group-hover:brightness-110"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </button>
              </FadeUp>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function GalleryGrid({
  images,
  onImageClick,
}: {
  images: MediaT[];
  onImageClick: (index: number) => void;
}) {
  return (
    <>
      {/* Mobile: 2 columns */}
      <div className="md:hidden">
        <MasonryColumns
          images={images}
          numCols={2}
          offsets={["mt-0", "mt-10"]}
          onImageClick={onImageClick}
        />
      </div>
      {/* Tablet: 3 columns */}
      <div className="hidden md:block lg:hidden">
        <MasonryColumns
          images={images}
          numCols={3}
          offsets={["mt-0", "mt-16", "mt-4"]}
          onImageClick={onImageClick}
        />
      </div>
      {/* Desktop: 4 columns */}
      <div className="hidden lg:block">
        <MasonryColumns
          images={images}
          numCols={4}
          offsets={[...COLUMN_OFFSETS]}
          onImageClick={onImageClick}
        />
      </div>
    </>
  );
}
