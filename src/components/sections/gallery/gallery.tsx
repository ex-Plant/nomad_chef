"use client";

import { useRef, useState } from "react";
import { m } from "framer-motion";

import { Image } from "@/components/ui/image";
import { GalleryLightbox } from "@/components/ui/gallery-lightbox";

import { Button } from "@/components/shared/button";
import { FadeUp } from "@/components/shared/fade-up";
import { ScatterText } from "@/components/shared/scatter-text";
import { SECTION_IDS } from "@/config/section-ids";
import type { MediaT, SiteT } from "@/types/site";
import { Section } from "@/components/shared/section";
import { SectionContent } from "@/components/shared/section-content";

import { EyebrowTag } from "@/components/shared/eyebrow-tag";

/* Staggered masonry: images distributed round-robin into columns,
   each column starts at a different vertical offset for organic rhythm.
   Fully CMS-safe — works with any number of images from backend. */

const COLUMN_OFFSETS = ["mt-0", "mt-16", "mt-4", "mt-12"] as const;

function distributeIntoColumns<TItem>(
  items: TItem[],
  numCols: number,
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

        {/* Mobile-only CTA: tile taps are disabled on mobile (too easy to misfire while scrolling),
            so users open the gallery explicitly from here. */}
        <FadeUp className="mt-10 flex justify-center md:hidden">
          <Button
            variant="coral"
            size="compact"
            onClick={() => setOpenIndex(0)}
          >
            Zobacz galerię
          </Button>
        </FadeUp>

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
          <div className="bg-coral h-px flex-1" />
          <span className="text-label-sm text-coral">{data.handle}</span>
          <div className="bg-coral h-px flex-1" />
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
  interactive,
}: {
  images: MediaT[];
  numCols: number;
  offsets: string[];
  onImageClick: (index: number) => void;
  interactive: boolean;
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
              <GalleryTile
                key={`${image.url}-${globalIndex}`}
                image={image}
                index={globalIndex}
                onTap={onImageClick}
                interactive={interactive}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

/* Tap-vs-scroll guard: on a wall-to-wall masonry, the browser's default
   click heuristic fires too eagerly on near-stationary touches. We track
   pointer movement / duration and suppress the open if the gesture looks
   like a scroll attempt. Keyboard activations bypass the guard.

   Tuning: if misfires persist on mobile, drop TAP_MAX_MOVE_PX to 4. If real
   taps feel laggy or missed, raise TAP_MAX_DURATION_MS to 500. */
const TAP_MAX_MOVE_PX = 6;
const TAP_MAX_DURATION_MS = 400;

function GalleryTile({
  image,
  index,
  onTap,
  interactive,
}: {
  image: MediaT;
  index: number;
  onTap: (index: number) => void;
  interactive: boolean;
}) {
  const [inView, setInView] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const tapRef = useRef<{
    x: number;
    y: number;
    t: number;
    valid: boolean;
  } | null>(null);

  function handlePointerDown(e: React.PointerEvent<HTMLButtonElement>) {
    tapRef.current = {
      x: e.clientX,
      y: e.clientY,
      t: performance.now(),
      valid: true,
    };
  }

  function handlePointerMove(e: React.PointerEvent<HTMLButtonElement>) {
    const start = tapRef.current;
    if (!start || !start.valid) return;
    const dx = Math.abs(e.clientX - start.x);
    const dy = Math.abs(e.clientY - start.y);
    if (dx > TAP_MAX_MOVE_PX || dy > TAP_MAX_MOVE_PX) start.valid = false;
  }

  function handlePointerCancel() {
    tapRef.current = null;
  }

  function handleClick() {
    const start = tapRef.current;
    tapRef.current = null;
    // Keyboard / non-pointer activation: no tracked touch — allow.
    if (!start) {
      onTap(index);
      return;
    }
    if (start.valid && performance.now() - start.t < TAP_MAX_DURATION_MS) {
      onTap(index);
    }
  }

  const shouldShow = inView && loaded;

  const img = (
    <Image
      src={image.url}
      alt={image.alt}
      width={image.width ?? 1200}
      height={image.height ?? 1200}
      priority={index < 4}
      onLoad={() => setLoaded(true)}
      className="ease-brand transition-all duration-700 group-hover:scale-105 group-hover:brightness-110"
      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
    />
  );

  return (
    <m.div
      className="group"
      initial={{ opacity: 0 }}
      animate={{ opacity: shouldShow ? 1 : 0 }}
      onViewportEnter={() => setInView(true)}
      viewport={{ once: true, amount: 0.1 }}
      transition={{
        duration: 0.5,
        delay: shouldShow ? (index % 8) * 0.1 : 0,
        ease: "easeOut",
      }}
    >
      {interactive ? (
        <button
          type="button"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerCancel={handlePointerCancel}
          onClick={handleClick}
          className="focus-visible:ring-coral block w-full cursor-zoom-in touch-pan-y overflow-hidden rounded-lg focus:outline-none focus-visible:ring-2"
          aria-label={`Otwórz zdjęcie: ${image.alt}`}
        >
          {img}
        </button>
      ) : (
        <div className="block w-full overflow-hidden rounded-lg">{img}</div>
      )}
    </m.div>
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
      {/* Mobile: 2 columns — tiles non-interactive; CTA below opens the gallery */}
      <div className="md:hidden">
        <MasonryColumns
          images={images}
          numCols={2}
          offsets={["mt-0", "mt-10"]}
          onImageClick={onImageClick}
          interactive={false}
        />
      </div>
      {/* Tablet: 3 columns */}
      <div className="hidden md:block lg:hidden">
        <MasonryColumns
          images={images}
          numCols={3}
          offsets={["mt-0", "mt-16", "mt-4"]}
          onImageClick={onImageClick}
          interactive
        />
      </div>
      {/* Desktop: 4 columns */}
      <div className="hidden lg:block">
        <MasonryColumns
          images={images}
          numCols={4}
          offsets={[...COLUMN_OFFSETS]}
          onImageClick={onImageClick}
          interactive
        />
      </div>
    </>
  );
}
