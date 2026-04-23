"use client";

import * as Dialog from "@radix-ui/react-dialog";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import NextImage, { type StaticImageData } from "next/image";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/shared/button";

type LightboxImageT = {
  src: StaticImageData | string;
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
  // Also sync selectedIndex eagerly so the counter never flashes a stale
  // value when openIndex changes (component stays mounted across open/close,
  // and scrollTo is a no-op when the target equals the current snap).
  useEffect(() => {
    if (openIndex === undefined) return;
    setSelectedIndex(openIndex);
    if (emblaApi) emblaApi.scrollTo(openIndex, true);
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
        <Dialog.Overlay className="fixed inset-0 z-300 bg-black data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-0 z-300 outline-none"
        >
          <Dialog.Title className="sr-only">Galeria</Dialog.Title>

          <div ref={emblaRef} className="h-full w-full overflow-hidden">
            <div className="flex h-full">
              {images.map((image, i) => (
                <div
                  key={i}
                  className="relative flex h-full min-w-0 flex-[0_0_100%] items-center justify-center px-6 pb-32 pt-12 md:px-24 md:py-16"
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

          <Dialog.Close asChild>
            <Button
              variant="yellow"
              size="icon-sm"
              aria-label="Zamknij"
              className="absolute right-6 top-6 z-10"
            >
              <X size={20} strokeWidth={2.5} aria-hidden="true" />
            </Button>
          </Dialog.Close>

          <div className="absolute bottom-24 left-1/2 z-10 -translate-x-1/2 font-geist text-sm text-yellow md:bottom-8">
            {selectedIndex + 1} / {images.length}
          </div>

          <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 gap-3 md:hidden">
            <Button
              variant="yellow"
              size="icon-sm"
              onClick={scrollPrev}
              aria-label="Poprzednie zdjęcie"
            >
              <ArrowLeft size={20} strokeWidth={2.5} aria-hidden="true" />
            </Button>
            <Button
              variant="yellow"
              size="icon-sm"
              onClick={scrollNext}
              aria-label="Następne zdjęcie"
            >
              <ArrowRight size={20} strokeWidth={2.5} aria-hidden="true" />
            </Button>
          </div>

          <Button
            variant="yellow"
            size="icon-sm"
            onClick={scrollPrev}
            aria-label="Poprzednie zdjęcie"
            className="absolute left-6 top-1/2 z-10 hidden -translate-y-1/2 md:inline-flex"
          >
            <ArrowLeft size={20} strokeWidth={2.5} aria-hidden="true" />
          </Button>
          <Button
            variant="yellow"
            size="icon-sm"
            onClick={scrollNext}
            aria-label="Następne zdjęcie"
            className="absolute right-6 top-1/2 z-10 hidden -translate-y-1/2 md:inline-flex"
          >
            <ArrowRight size={20} strokeWidth={2.5} aria-hidden="true" />
          </Button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
