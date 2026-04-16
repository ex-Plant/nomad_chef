import NextImage from "next/image";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "../../helpers/cn";

type ImagePropsT = Omit<
  ComponentPropsWithoutRef<typeof NextImage>,
  "sizes" | "quality"
> & {
  sizes: string;
};

export function Image({ ...props }: ImagePropsT) {
  return (
    <NextImage
      quality={90}
      {...props}
      className={cn(`rounded-lg object-cover`, props.className)}
    />
  );
}
