import NextImage from "next/image";
import type { ComponentPropsWithoutRef } from "react";

type ImagePropsT = Omit<ComponentPropsWithoutRef<typeof NextImage>, "sizes" | "quality"> & {
  sizes: string;
};

export function Image({ ...props }: ImagePropsT) {
  return <NextImage quality={90} {...props} />;
}
