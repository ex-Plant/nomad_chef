"use client";

import * as Dialog from "@radix-ui/react-dialog";
import useEmblaCarousel from "embla-carousel-react";
import NextImage, { type StaticImageData } from "next/image";
import { useCallback, useEffect, useState } from "react";

import { ChevronIcon, CloseIcon } from "@/components/ui/icons";

type LightboxImageT = {
  src: StaticImageData;
  alt: string;
};

type GalleryLightboxPropsT = {
  images: LightboxImageT[];
  openIndex: number | undefined;
  onClose: () => void;
};

export function GalleryLightbox({
  images,
  openIndex,
  onClose,
}: GalleryLightboxPropsT) {
  const isOpen = openIndex !== undefined;

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    startIndex: openIndex ?? 0,
  });
  const [selectedIndex, setSelectedIndex] = useState(openIndex ?? 0);

  // Jump to the clicked image; embla fires `select` afterwards,
  // which keeps selectedIndex in sync via the effect below.
  useEffect(() => {
    if (!emblaApi || openIndex === undefined) return;
    emblaApi.scrollTo(openIndex, true);
  }, [emblaApi, openIndex]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") scrollPrev();
      if (event.key === "ArrowRight") scrollNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, scrollPrev, scrollNext]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-spline-ivory-black data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-0 z-50 outline-none"
        >
          <Dialog.Title className="sr-only">Galeria</Dialog.Title>

          <div ref={emblaRef} className="h-full w-full overflow-hidden">
            <div className="flex h-full">
              {images.map((image, i) => (
                <div
                  key={i}
                  className="relative flex h-full min-w-0 flex-[0_0_100%] items-center justify-center p-6 md:p-12"
                >
                  <div className="relative h-full w-full">
                    <NextImage
                      src={image.src}
                      alt={image.alt}
                      fill
                      quality={90}
                      sizes="100vw"
                      className="object-contain"
                      priority={i === selectedIndex}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Dialog.Close
            aria-label="Zamknij"
            className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-warm-white/10 text-warm-white backdrop-blur-sm transition hover:bg-warm-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-warm-white"
          >
            <CloseIcon />
          </Dialog.Close>

          <button
            type="button"
            aria-label="Poprzednie zdjęcie"
            onClick={scrollPrev}
            className="absolute left-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 cursor-w-resize items-center justify-center rounded-full bg-warm-white/10 text-warm-white backdrop-blur-sm transition hover:bg-warm-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-warm-white"
          >
            <ChevronIcon direction="left" />
          </button>

          <button
            type="button"
            aria-label="Następne zdjęcie"
            onClick={scrollNext}
            className="absolute right-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 cursor-e-resize items-center justify-center rounded-full bg-warm-white/10 text-warm-white backdrop-blur-sm transition hover:bg-warm-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-warm-white"
          >
            <ChevronIcon direction="right" />
          </button>

          <div className="text-label-sm absolute bottom-6 left-1/2 z-10 -translate-x-1/2 rounded-full bg-warm-white/10 px-4 py-2 text-warm-white tabular-nums backdrop-blur-sm">
            {selectedIndex + 1} / {images.length}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

